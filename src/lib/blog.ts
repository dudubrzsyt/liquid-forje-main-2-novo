import blog1 from "@/assets/blog-1.jpg";
import blog2 from "@/assets/blog-2.jpg";
import blog3 from "@/assets/blog-3.jpg";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: "Desenvolvimento" | "Performance" | "Conversão" | "Design" | "Negócios";
  date: string;
  readingMinutes: number;
  cover: string;
  body: { h?: string; p: string }[];
};

export const BLOG_CATEGORIES = [
  "Todos",
  "Desenvolvimento",
  "Performance",
  "Conversão",
  "Design",
  "Negócios",
] as const;

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "typescript-que-escala",
    title: "TypeScript que escala: como estruturo um projeto para durar anos",
    excerpt:
      "Tipos como contrato, camadas previsíveis e zero gambiarra. O que eu aplico em todo projeto entregue.",
    category: "Desenvolvimento",
    date: "2026-07-12",
    readingMinutes: 7,
    cover: blog1,
    body: [
      {
        p: "Um projeto morre lento. Nunca é uma decisão só — é um acúmulo de atalhos que ninguém documentou. TypeScript ajuda, mas só quando ele é usado como contrato e não como enfeite.",
      },
      {
        h: "1. Tipos primeiro, UI depois",
        p: "Antes de escrever o primeiro componente eu modelo os dados. Se o tipo fica confuso no papel, a tela vai ficar confusa também. Modelar cedo evita refatoração cara depois.",
      },
      {
        h: "2. Camadas com fronteira clara",
        p: "Dados, regra de negócio e apresentação vivem separados. Componente não fala com banco; ele consome uma função tipada. Isso torna qualquer troca de backend indolor.",
      },
      {
        h: "3. Erros são parte do design",
        p: "Estados de carregamento, vazio e falha são desenhados junto com o estado feliz. É o que separa um site bonito de um produto confiável.",
      },
      {
        p: "Resultado prático: manutenção barata, onboarding rápido de qualquer dev e um site que continua evoluindo sem reescrita.",
      },
    ],
  },
  {
    slug: "performance-real-em-2026",
    title: "Performance real: como chegar a 95+ sem sacrificar o visual",
    excerpt:
      "Shaders, vídeo e vidro podem coexistir com Core Web Vitals verdes. É questão de orçamento de bytes.",
    category: "Performance",
    date: "2026-06-28",
    readingMinutes: 6,
    cover: blog2,
    body: [
      {
        p: "Site bonito e site rápido não são inimigos. O que mata a performance é falta de orçamento: cada efeito precisa ter um custo aceito conscientemente.",
      },
      {
        h: "Orçamento de bytes",
        p: "Defino um teto por página antes de começar. Toda imagem, fonte e biblioteca disputa esse espaço — e quem não justifica o custo fica de fora.",
      },
      {
        h: "Efeito na GPU, nunca no layout",
        p: "Animações usam apenas transform e opacity. Blur e gradientes ficam em camadas isoladas, evitando repaint da árvore inteira.",
      },
      {
        h: "Mídia sob controle",
        p: "Imagens com dimensões declaradas, formatos modernos e carregamento tardio fora da primeira dobra. Vídeo só entra quando o usuário demonstra interesse.",
      },
      {
        p: "Com essas três regras, sites com shaders líquidos ainda abrem em menos de dois segundos no 4G.",
      },
    ],
  },
  {
    slug: "checkout-que-nao-perde-venda",
    title: "Checkout que não perde venda: 9 detalhes que mudam a taxa",
    excerpt:
      "Micro decisões de interface que aumentam receita sem gastar um centavo a mais em tráfego.",
    category: "Conversão",
    date: "2026-06-05",
    readingMinutes: 8,
    cover: blog3,
    body: [
      {
        p: "A maior parte das lojas não tem problema de tráfego: tem vazamento no fim do funil. Consertar isso é mais barato que comprar mais visitas.",
      },
      {
        h: "Reduza campos, não etapas",
        p: "Etapas curtas dão sensação de progresso. Campos desnecessários dão preguiça. Peça o mínimo e complete o resto depois da compra.",
      },
      {
        h: "Preço sem surpresa",
        p: "Frete e taxas visíveis desde o carrinho. Surpresa no último passo é o principal motivo de abandono.",
      },
      {
        h: "Confiança visível",
        p: "Selo de segurança, política de troca e suporte real ao lado do botão de pagar — não escondidos no rodapé.",
      },
      {
        p: "Aplicando esse pacote em lojas reais, a média de ganho ficou entre 18% e 31% de conversão adicional.",
      },
    ],
  },
  {
    slug: "vidro-liquido-sem-exagero",
    title: "Vidro líquido sem exagero: hierarquia visual em interfaces translúcidas",
    excerpt:
      "Transparência é tempero, não prato principal. Como manter legibilidade com estética glass.",
    category: "Design",
    date: "2026-05-19",
    readingMinutes: 5,
    cover: blog1,
    body: [
      {
        p: "Interfaces de vidro encantam na primeira olhada e cansam na segunda quando não existe hierarquia. O truque é usar contraste como âncora.",
      },
      {
        h: "Uma superfície dominante",
        p: "Escolha uma única camada translúcida como protagonista. Todo o resto é sólido ou quase sólido.",
      },
      {
        h: "Texto nunca flutua sozinho",
        p: "Todo texto sobre vidro precisa de um fundo com contraste mínimo garantido. Se depende da imagem de fundo, já falhou.",
      },
      { p: "Estética premium é disciplina: menos efeitos, melhor executados." },
    ],
  },
  {
    slug: "quanto-custa-um-site",
    title: "Quanto custa um site de verdade — e por que faixas existem",
    excerpt:
      "Da landing de R$ 1.500 ao projeto corporativo de sete dígitos: o que muda de fato no escopo.",
    category: "Negócios",
    date: "2026-04-30",
    readingMinutes: 6,
    cover: blog2,
    body: [
      {
        p: "Preço de site não é tabela arbitrária: é reflexo de risco, escopo e responsabilidade sobre receita.",
      },
      {
        h: "O que escala o valor",
        p: "Integrações, volume de tráfego, requisitos de segurança, número de perfis de usuário e nível de personalização visual.",
      },
      {
        h: "O que não deveria escalar",
        p: "Quantidade de páginas isolada. Vinte páginas com o mesmo template custam menos que três telas com regra de negócio pesada.",
      },
      { p: "Transparência sobre isso é o que transforma orçamento em parceria de longo prazo." },
    ],
  },
  {
    slug: "seo-tecnico-para-negocios",
    title: "SEO técnico para negócios: o mínimo que todo site precisa ter",
    excerpt:
      "Estrutura semântica, metadados por página e dados estruturados — a base que quase ninguém faz direito.",
    category: "Desenvolvimento",
    date: "2026-04-08",
    readingMinutes: 5,
    cover: blog3,
    body: [
      { p: "SEO técnico não substitui conteúdo, mas sem ele o melhor conteúdo fica invisível." },
      {
        h: "Uma rota, uma intenção",
        p: "Cada assunto merece uma URL própria, com título e descrição únicos. Âncoras internas não são páginas.",
      },
      {
        h: "HTML com significado",
        p: "Cabeçalhos em ordem, imagens com texto alternativo, links descritivos. O robô lê estrutura antes de ler estilo.",
      },
      { p: "É trabalho invisível que aparece no faturamento seis meses depois." },
    ],
  },
];

export function getPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function formatDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
