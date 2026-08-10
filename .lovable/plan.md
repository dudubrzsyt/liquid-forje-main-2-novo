## Fase 1 — Devs, Score IA, Assinaturas e Admin

Mantém todo o design atual (vidro iOS 27 + azul Diamante.dev), com responsividade e animações consistentes nas páginas novas.

### 1. Banco de dados
- `dev_profiles`: nome, idade, bio, stack (lista), senioridade, graduações, github_url, linkedin_url, avatar, status (`em_analise` / `aprovado` / `rejeitado`), score (0–100), tier de diamante, `disponivel`, `perfil_completo`.
- `dev_ai_analysis`: dados brutos do GitHub (commits, linguagens, idade da conta, repositórios públicos), resumo da IA, score calculado, data.
- `subscriptions`: plano (`basico` R$45 / `elite` R$85), status, valor, dia de pagamento, vencimento (30 dias), histórico em `subscription_events`.
- `user_roles` + enum `app_role` (`admin`, `dev`, `cliente`) com função `has_role` — cargo admin nunca fica no perfil.
- `audit_logs`: ações de admin.
- RLS em tudo: dev edita só o próprio perfil; ranking público lê apenas perfis aprovados, completos, disponíveis e com assinatura ativa; admin vê tudo via `has_role`.

### 2. Página "Cadastre-se como Dev" (`/cadastro-dev`)
- Formulário validado (zod) com todos os campos pedidos + upload de avatar.
- Aviso "Seu perfil será analisado pela IA em até 30–60 minutos".
- Ao enviar: perfil entra como `em_analise` e dispara a análise real.

### 3. Pipeline de análise (real)
- Server function busca a API pública do GitHub: idade da conta, repositórios públicos, linguagens, atividade de commits.
- A IA da Lovable gera resumo de confiabilidade e score inicial; score final = sinais do GitHub + peso do plano de assinatura.
- Verificação de GitHub obrigatória: sem conta válida, perfil não é aprovado.
- Tiers em diamante: negro, rosa, perolado, rubi, diamante negro, elite — com badge animado reutilizável.

### 4. Ranking de devs (`/devs`)
- Só aparece quem tem assinatura ativa, perfil completo, aprovado e disponível.
- Ordenação: plano (Elite acima de Básico) → score → atividade.
- Filtros por stack, senioridade e tier; cards com badge de diamante.

### 5. Assinaturas (`/assinaturas`)
- Planos: Básico Rubi/Diamante Negro R$45 e Elite com IA R$85 (de R$90).
- Checkout real via Stripe integrado da Lovable (ambiente de teste primeiro), webhook sincronizando status.
- Dashboard: status, valor, dia de pagamento, vencimento em 30 dias e histórico.

### 6. Admin (`/admin`)
- Protegido pelo cargo `admin` no banco (não por senha em código). Você cria a conta com dudubrzsyt13@gmail.com e eu concedo o cargo.
- Gerenciar devs, aprovar/rejeitar perfis e análises da IA, ver assinaturas e pagamentos, ver logs de auditoria.

### 7. Perfil e navegação
- Perfil ampliado: senioridade, stack, graduações, bio, idade, GitHub, LinkedIn, badge de diamante e status de assinatura.
- Header/footer atualizados com os novos links, mantendo o estilo transparente.

### Segurança
- A senha enviada no chat não será usada em lugar nenhum — recomendo trocá-la agora, pois ficou exposta.
- Cargos em tabela separada, RLS restritiva, validação também no servidor.

### Fica para a Fase 2
Escrow (retenção do pagamento até aprovação do cliente), bloqueio de mensagens diretas sem assinatura, perfis públicos avançados e evolução da comunidade estilo Instagram/Discord.
