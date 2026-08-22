// src/routes/api/pagamento.ts
//
// ROTA DE BACKEND (Server Route do TanStack Start) — integração com a Asaas.
//
// POR QUE A ROTA ANTIGA NÃO FUNCIONAVA (2 problemas empilhados)
//
// 1) O arquivo antigo chamava-se "-paymentapi.ts" (com hífen na frente).
//    No TanStack Router, qualquer arquivo/pasta que começa com "-" é
//    IGNORADO de propósito pelo gerador de rotas (routeFileIgnorePrefix,
//    que por padrão é "-", serve pra você guardar arquivos de rascunho
//    dentro de src/routes sem virarem rota). Ou seja: essa rota nunca
//    existia de verdade, então /api/pagamento sempre caía no fallback do
//    SPA (o index.html) — por isso o front tentava fazer JSON.parse de
//    HTML e estourava "Unexpected token '<'".
//
// 2) O conteúdo do arquivo antigo usava `export async function POST()`
//    com `NextRequest`/`NextResponse` de "next/server" — convenção de
//    rota de API do Next.js App Router. O TanStack Start não entende
//    esse formato. A convenção certa é exportar `Route` via
//    `createFileRoute(caminho)({ server: { handlers } })`, onde
//    `caminho` precisa bater exatamente com a localização do arquivo
//    dentro de src/routes (senão a rota também não fica certa).
//
// ONDE COLOCAR ESTE ARQUIVO
// src/routes/api/pagamento.ts  →  cria o endpoint em  /api/pagamento
// (apague o antigo src/routes/api/-paymentapi.ts, não deixe os dois)
//
// VARIÁVEIS DE AMBIENTE NECESSÁRIAS (veja .env.example)
// ASAAS_API_KEY        chave de API da Asaas (sandbox ou produção)
// ASAAS_API_URL         opcional — padrão https://api.asaas.com/v3
//                        (sandbox: https://api-sandbox.asaas.com/v3)
// RESEND_API_KEY, FROM_EMAIL, OWNER_EMAIL, OWNER_PHONE,
// EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE_NAME  → opcionais,
// só são usadas para as notificações por e-mail/WhatsApp (best-effort).

import { createFileRoute } from '@tanstack/react-router'


// ============================================================
// TIPOS
// ============================================================

type BillingType = 'PIX' | 'CREDIT_CARD'
type ServiceType = 'subscription' | 'project' | 'donation'

interface CardData {
  holderName: string
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
}

interface PaymentRequestBody {
  amount: number
  billingType: BillingType
  serviceType: ServiceType
  itemId: string
  installmentCount?: number
  description: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerCpfCnpj: string
  customerPostalCode?: string
  customerAddressNumber?: string
  cardData?: CardData
}

interface AsaasErrorBody {
  errors?: { code: string; description: string }[]
}

interface AsaasCustomer {
  id: string
}

interface AsaasPayment {
  id: string
  status: string
  value: number
  billingType: string
  invoiceUrl?: string
  dueDate: string
}

interface AsaasSubscription {
  id: string
  status: string
}

interface PixQrCode {
  encodedImage: string
  payload: string
  expirationDate: string
}

// ============================================================
// CONFIGURAÇÃO
// ============================================================


const ASAAS_API_URL = import.meta.env.VITE_ASAAS_API_URL || 'https://api.asaas.com/v3';
const ASAAS_API_KEY = import.meta.env.VITE_ASAAS_API_KEY || '';


// dentro do POST handler, logo após validar body
console.log('VITE_ASAAS_API_URL:', import.meta.env.VITE_ASAAS_API_URL);
console.log('VITE_ASAAS_API_KEY presente:', !!import.meta.env.VITE_ASAAS_API_KEY);


const NOTIFY_CONFIG = {
  ownerEmail: import.meta.env.VITE_OWNER_EMAIL || '',
  ownerPhone: import.meta.env.VITE_OWNER_PHONE || '',
  fromEmail: import.meta.env.VITE_FROM_EMAIL || 'naoresponda@seudominio.com',
  resendApiKey: import.meta.env.VITE_RESEND_API_KEY || '',
  evolutionApiUrl: import.meta.env.VITE_EVOLUTION_API_URL || '',
  evolutionApiKey: import.meta.env.VITE_EVOLUTION_API_KEY || '',
  evolutionInstance: import.meta.env.VITE_EVOLUTION_INSTANCE_NAME || '',
}


// ============================================================
// CLIENTE HTTP DA ASAAS
// ============================================================

class AsaasError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function asaas<T>(path: string, init?: RequestInit): Promise<T> {
  if (!ASAAS_API_KEY) {
    throw new AsaasError(
      'ASAAS_API_KEY não configurada no servidor. Defina a variável de ambiente antes de aceitar pagamentos.',
      500,
    )
  }

  const response = await fetch(`${ASAAS_API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'checkout-app/1.0',
      // ATENÇÃO: o header correto é "access_token" (com underscore).
      // "access-token" (com hífen), usado no arquivo antigo, é ignorado
      // pela Asaas e resulta em 401 Unauthorized.
      access_token: ASAAS_API_KEY,
      ...(init?.headers || {}),
    },
  })

  const raw = await response.text()
  let data: unknown = {}
  try {
    data = raw ? JSON.parse(raw) : {}
  } catch {
    // A Asaas quase sempre responde JSON, mas se um proxy/CDN devolver
    // HTML de erro (ex: 502/504), não queremos estourar um JSON.parse
    // cru — melhor virar um erro legível pro cliente.
    throw new AsaasError(
      'A Asaas retornou uma resposta inesperada (não-JSON). Tente novamente em instantes.',
      502,
    )
  }

  if (!response.ok) {
    const errBody = data as AsaasErrorBody
    const message =
      errBody.errors?.map((e) => e.description).join(' ') ||
      'Erro ao comunicar com a Asaas.'
    throw new AsaasError(message, response.status)
  }

  return data as T
}

// ============================================================
// HELPERS
// ============================================================

function onlyDigits(value: string) {
  return (value || '').replace(/\D/g, '')
}

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

function getClientIp(request: Request): string {
  // A Asaas exige o IP real do comprador (antifraude), nunca o IP do
  // servidor. Em praticamente todo provedor (Vercel, Netlify, Cloudflare,
  // proxy reverso próprio) o IP do visitante chega em um destes headers.
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp
  return '127.0.0.1'
}

function isValidCpf(cpf: string) {
  const digits = onlyDigits(cpf)
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false
  const calc = (len: number) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += parseInt(digits[i], 10) * (len + 1 - i)
    const rest = (sum * 10) % 11
    return rest === 10 ? 0 : rest
  }
  return calc(9) === parseInt(digits[9], 10) && calc(10) === parseInt(digits[10], 10)
}

function isValidDocument(doc: string) {
  const digits = onlyDigits(doc)
  if (digits.length === 11) return isValidCpf(digits)
  if (digits.length === 14) return true // validação completa de CNPJ fica a cargo da Asaas
  return false
}

// ============================================================
// CLIENTE ASAAS — BUSCAR OU CRIAR
// ============================================================

async function findOrCreateCustomer(body: PaymentRequestBody): Promise<string> {
  const cpfCnpj = onlyDigits(body.customerCpfCnpj)

  // Evita criar clientes duplicados a cada pagamento — a Asaas permite
  // duplicatas, então a responsabilidade de deduplicar é nossa.
  const existing = await asaas<{ data: AsaasCustomer[] }>(`/customers?cpfCnpj=${cpfCnpj}`)

  if (existing.data && existing.data.length > 0) {
    return existing.data[0].id
  }

  const created = await asaas<AsaasCustomer>('/customers', {
    method: 'POST',
    body: JSON.stringify({
      name: body.customerName,
      email: body.customerEmail,
      phone: onlyDigits(body.customerPhone),
      mobilePhone: onlyDigits(body.customerPhone),
      cpfCnpj,
      postalCode: body.customerPostalCode ? onlyDigits(body.customerPostalCode) : undefined,
      addressNumber: body.customerAddressNumber || undefined,
    }),
  })

  return created.id
}

// ============================================================
// DADOS DE CARTÃO NO FORMATO DA ASAAS
// ============================================================

function buildCardPayload(body: PaymentRequestBody, remoteIp: string) {
  if (body.billingType !== 'CREDIT_CARD' || !body.cardData) return {}

  return {
    creditCard: {
      holderName: body.cardData.holderName,
      number: onlyDigits(body.cardData.cardNumber),
      expiryMonth: body.cardData.expiryMonth.padStart(2, '0'),
      expiryYear: `20${onlyDigits(body.cardData.expiryYear).slice(-2)}`,
      ccv: body.cardData.cvv,
    },
    creditCardHolderInfo: {
      name: body.customerName,
      email: body.customerEmail,
      cpfCnpj: onlyDigits(body.customerCpfCnpj),
      postalCode: onlyDigits(body.customerPostalCode || ''),
      addressNumber: body.customerAddressNumber || 'S/N',
      phone: onlyDigits(body.customerPhone),
    },
    // Necessário para a Asaas tentar a autorização no ato da criação
    // da cobrança/assinatura. Sem isso, o pagamento fica pendente na
    // fatura em vez de ser cobrado agora.
    remoteIp,
  }
}

// ============================================================
// COBRANÇA AVULSA (projeto ou doação)
// ============================================================

async function createOneOffPayment(customerId: string, body: PaymentRequestBody, remoteIp: string) {
  return asaas<AsaasPayment>('/payments', {
    method: 'POST',
    body: JSON.stringify({
      customer: customerId,
      billingType: body.billingType,
      value: body.amount,
      dueDate: todayISO(),
      description: body.description,
      installmentCount:
        body.billingType === 'CREDIT_CARD' ? Math.max(1, body.installmentCount || 1) : 1,
      ...buildCardPayload(body, remoteIp),
    }),
  })
}

// ============================================================
// ASSINATURA RECORRENTE (plano)
// ============================================================

async function createSubscription(customerId: string, body: PaymentRequestBody, remoteIp: string) {
  const subscription = await asaas<AsaasSubscription>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      customer: customerId,
      billingType: body.billingType,
      value: body.amount,
      cycle: 'MONTHLY',
      // Usar a data de hoje faz a 1ª cobrança sair imediatamente; as
      // próximas seguem o ciclo mensal automaticamente.
      nextDueDate: todayISO(),
      description: body.description,
      ...buildCardPayload(body, remoteIp),
    }),
  })

  // A assinatura em si (sub_...) não é uma cobrança. Para exibir o QR Code
  // Pix, precisamos da cobrança gerada a partir dela.
  const payments = await asaas<{ data: AsaasPayment[] }>(
    `/subscriptions/${subscription.id}/payments`,
  )

  return {
    subscription,
    firstPayment: payments.data?.[0],
  }
}

// ============================================================
// QR CODE PIX
// ============================================================

async function fetchPixQrCode(paymentId: string) {
  // O QR Code NÃO vem na criação da cobrança — é preciso buscar em um
  // endpoint separado. O código antigo assumia (errado) que `pixQrCode`
  // já vinha pronto na resposta de POST /payments.
  return asaas<PixQrCode>(`/payments/${paymentId}/pixQrCode`)
}

// ============================================================
// STATUS DA COBRANÇA (para o botão/polling "já paguei")
// ============================================================

async function fetchPaymentStatus(paymentId: string) {
  return asaas<{ status: string }>(`/payments/${paymentId}`)
}

// ============================================================
// NOTIFICAÇÕES — melhor esforço, nunca derrubam o pagamento
// ============================================================

async function sendEmail(to: string, subject: string, html: string) {
  if (!NOTIFY_CONFIG.resendApiKey) return
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${NOTIFY_CONFIG.resendApiKey}`,
      },
      body: JSON.stringify({ from: NOTIFY_CONFIG.fromEmail, to, subject, html }),
    })
  } catch (error) {
    console.error('[EMAIL] falha ao enviar:', error)
  }
}

async function sendWhatsApp(phone: string, message: string) {
  if (!NOTIFY_CONFIG.evolutionApiUrl || !NOTIFY_CONFIG.evolutionApiKey) return
  try {
    await fetch(
      `${NOTIFY_CONFIG.evolutionApiUrl}/message/sendText/${NOTIFY_CONFIG.evolutionInstance}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: NOTIFY_CONFIG.evolutionApiKey,
        },
        body: JSON.stringify({ number: onlyDigits(phone), text: message }),
      },
    )
  } catch (error) {
    console.error('[WHATSAPP] falha ao enviar:', error)
  }
}

function serviceLabel(serviceType: ServiceType) {
  if (serviceType === 'subscription') return 'Assinatura'
  if (serviceType === 'donation') return 'Doação'
  return 'Projeto'
}

async function notifyEveryone(body: PaymentRequestBody, pix: PixQrCode | null) {
  const label = serviceLabel(body.serviceType)

  const customerHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${label} recebida</h2>
      <p>Olá ${body.customerName},</p>
      <p>Seu pedido de <strong>R$ ${body.amount.toFixed(2)}</strong> (${body.description}) foi registrado.</p>
      ${
        pix
          ? `<p>Escaneie o QR Code Pix ou copie o código abaixo para concluir o pagamento:</p>
             <code style="display:block;background:#f5f5f5;padding:10px;border-radius:6px;word-break:break-all;">${pix.payload}</code>
             <p style="color:#b45309;font-size:12px;">Código Pix válido até ${pix.expirationDate}.</p>`
          : `<p>Assim que a cobrança for confirmada, você recebe a liberação automaticamente.</p>`
      }
    </div>
  `

  const ownerHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Novo pedido — ${label}</h2>
      <p><strong>Cliente:</strong> ${body.customerName} (${body.customerEmail})</p>
      <p><strong>Telefone:</strong> ${body.customerPhone}</p>
      <p><strong>Valor:</strong> R$ ${body.amount.toFixed(2)}</p>
      <p><strong>Forma de pagamento:</strong> ${body.billingType}</p>
      <p><strong>Descrição:</strong> ${body.description}</p>
    </div>
  `

  await Promise.allSettled([
    sendEmail(body.customerEmail, `Seu pedido — ${label}`, customerHtml),
    NOTIFY_CONFIG.ownerEmail
      ? sendEmail(NOTIFY_CONFIG.ownerEmail, `[Novo pedido] ${label} — ${body.customerName}`, ownerHtml)
      : Promise.resolve(),
    NOTIFY_CONFIG.ownerPhone
      ? sendWhatsApp(
          NOTIFY_CONFIG.ownerPhone,
          `Novo pedido (${label})\nCliente: ${body.customerName}\nValor: R$ ${body.amount.toFixed(2)}`,
        )
      : Promise.resolve(),
  ])
}

// ============================================================
// VALIDAÇÃO DO PAYLOAD
// ============================================================

function validateBody(body: Partial<PaymentRequestBody>): string | null {
  if (!body.customerName?.trim()) return 'Informe seu nome completo.'
  if (!body.customerEmail?.trim() || !body.customerEmail.includes('@')) return 'Informe um e-mail válido.'
  if (!body.customerPhone?.trim()) return 'Informe um telefone/WhatsApp válido.'
  if (!body.customerCpfCnpj || !isValidDocument(body.customerCpfCnpj)) return 'Informe um CPF ou CNPJ válido.'
  if (!body.amount || body.amount <= 0) return 'Valor inválido.'
  if (body.billingType !== 'PIX' && body.billingType !== 'CREDIT_CARD') return 'Forma de pagamento inválida.'
  if (!body.serviceType) return 'Tipo de pedido inválido.'

  if (body.billingType === 'CREDIT_CARD') {
    if (!body.customerPostalCode) return 'Informe o CEP para pagamento com cartão.'
    if (!body.customerAddressNumber) return 'Informe o número do endereço para pagamento com cartão.'
    const c = body.cardData
    if (!c?.holderName || !c.cardNumber || !c.expiryMonth || !c.expiryYear || !c.cvv) {
      return 'Preencha todos os dados do cartão.'
    }
  }

  return null
}

// ============================================================
// ROTA
// ============================================================
//
// IMPORTANTÍSSIMO: o caminho passado pra createFileRoute precisa bater
// exatamente com a localização do arquivo dentro de src/routes. Como
// este arquivo está em src/routes/api/pagamento.ts, o caminho é
// '/api/pagamento' (e é essa a URL que o front-end deve chamar).

export const Route = createFileRoute('/api/pagamento')({
  server: {
    handlers: {
      // GET /api/pagamento               → healthcheck
      // GET /api/pagamento?paymentId=xxx → consulta status (usado no polling do Pix)
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const paymentId = url.searchParams.get('paymentId')

        if (paymentId) {
          try {
            const status = await fetchPaymentStatus(paymentId)
            return Response.json({ success: true, status: status.status })
          } catch (error: any) {
            const message = error instanceof AsaasError ? error.message : 'Erro ao consultar pagamento.'
            return Response.json({ success: false, error: message }, { status: 400 })
          }
        }

        return Response.json({
          success: true,
          message: 'Endpoint de pagamentos ativo. Use POST para criar uma cobrança.',
        })
      },

      POST: async ({ request }) => {
        let body: PaymentRequestBody

        try {
          body = await request.json()
        } catch {
          return Response.json({ success: false, error: 'JSON inválido.' }, { status: 400 })
        }

        const validationError = validateBody(body)
        if (validationError) {
          return Response.json({ success: false, error: validationError }, { status: 400 })
        }

        // Pegando variáveis de ambiente via Vite (server-side)
        const ASAAS_API_URL = import.meta.env.VITE_ASAAS_API_URL
        const ASAAS_API_KEY = import.meta.env.VITE_ASAAS_API_KEY

        if (!ASAAS_API_KEY) {
          console.error('[PAGAMENTO] ASAAS_API_KEY ausente em import.meta.env')
          return Response.json(
            { success: false, error: 'ASAAS_API_KEY não configurada no servidor.' },
            { status: 500 }
          )
        }

        try {
          const remoteIp = getClientIp(request)
          const customerId = await findOrCreateCustomer(body)

          let paymentId: string | undefined
          let subscriptionId: string | undefined
          let invoiceUrl: string | undefined

          if (body.serviceType === 'subscription') {
            const { subscription, firstPayment } = await createSubscription(customerId, body, remoteIp)
            subscriptionId = subscription.id
            paymentId = firstPayment?.id
            invoiceUrl = firstPayment?.invoiceUrl
          } else {
            const payment = await createOneOffPayment(customerId, body, remoteIp)
            paymentId = payment.id
            invoiceUrl = payment.invoiceUrl
          }

          let pix: PixQrCode | null = null
          if (body.billingType === 'PIX' && paymentId) {
            pix = await fetchPixQrCode(paymentId)
          }

          // Best-effort: se e-mail/WhatsApp falharem, o pagamento já está
          // criado e a resposta segue normalmente para o cliente.
          notifyEveryone(body, pix).catch((error) => console.error('[NOTIFY] erro inesperado:', error))

          return Response.json({
            success: true,
            paymentId,
            subscriptionId,
            invoiceUrl,
            pixQrCode: pix ? `data:image/png;base64,${pix.encodedImage}` : undefined,
            pixCopyPaste: pix?.payload,
            pixExpiration: pix?.expirationDate,
          })
        } catch (error: any) {
          console.error('[PAGAMENTO] erro ao processar:', error)
          const message =
            error instanceof AsaasError
              ? error.message
              : 'Não foi possível processar o pagamento. Tente novamente.'
          const status = error instanceof AsaasError ? error.status : 500
          return Response.json({ success: false, error: message }, { status })
        }
      },
    },
  },
})
