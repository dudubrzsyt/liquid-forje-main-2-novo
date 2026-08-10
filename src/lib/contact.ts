export const CONTACT = {
  whatsapp: "5511990047011",
  whatsappDisplay: "+55 11 99004-7011",
  instagram: "igoreduardodev",
  instagramUrl: "https://www.instagram.com/igoreduardodev/",
  email: "dudubrzsyt13@gmail.com",
  github: "https://github.com/dudubrzsyt",
  linkedin: "https://www.linkedin.com/in/igor-eduardo-pinheiro-de-araujo-araujo-8a8593357/",
  name: "Igor Eduardo Pinheiro de Araujo",
};

export function buildWhatsappUrl(message: string) {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function buildMailtoUrl(subject: string, body: string) {
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
