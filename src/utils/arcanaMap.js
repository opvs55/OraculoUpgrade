// src/utils/arcanaMap.js
// Mapa dos 22 Arcanos Maiores (0–21) com imagem, nome PT e palavra-chave

export const MAJOR_ARCANA = [
  { number: 0,  name: 'O Louco',           aliases: [],                                  keyword: 'Início & Liberdade',      img: 'assets/cartas/RWS1909_-_00_Fool.jpeg' },
  { number: 1,  name: 'O Mago',            aliases: [],                                  keyword: 'Vontade & Criação',       img: 'assets/cartas/RWS1909_-_01_Magician.jpeg' },
  { number: 2,  name: 'A Sacerdotisa',     aliases: ['a alta sacerdotisa'],              keyword: 'Intuição & Mistério',     img: 'assets/cartas/RWS1909_-_02_High_Priestess.jpeg' },
  { number: 3,  name: 'A Imperatriz',      aliases: [],                                  keyword: 'Abundância & Amor',       img: 'assets/cartas/RWS1909_-_03_Empress.jpeg' },
  { number: 4,  name: 'O Imperador',       aliases: [],                                  keyword: 'Estrutura & Poder',       img: 'assets/cartas/RWS1909_-_04_Emperor.jpeg' },
  { number: 5,  name: 'O Hierofante',      aliases: ['o papa'],                          keyword: 'Tradição & Fé',           img: 'assets/cartas/RWS1909_-_05_Hierophant.jpeg' },
  { number: 6,  name: 'Os Amantes',        aliases: ['os enamorados', 'o enamorado'],   keyword: 'União & Escolha',         img: 'assets/cartas/RWS1909_-_06_Lovers.jpeg' },
  { number: 7,  name: 'O Carro',           aliases: [],                                  keyword: 'Determinação & Vitória',  img: 'assets/cartas/RWS1909_-_07_Chariot.jpeg' },
  { number: 8,  name: 'A Força',           aliases: [],                                  keyword: 'Coragem & Domínio',       img: 'assets/cartas/RWS1909_-_08_Strength.jpeg' },
  { number: 9,  name: 'O Eremita',         aliases: [],                                  keyword: 'Sabedoria & Introspecção',img: 'assets/cartas/RWS1909_-_09_Hermit.jpeg' },
  { number: 10, name: 'A Roda da Fortuna', aliases: ['a roda'],                          keyword: 'Ciclos & Destino',        img: 'assets/cartas/RWS1909_-_10_Wheel_of_Fortune.jpeg' },
  { number: 11, name: 'A Justiça',         aliases: [],                                  keyword: 'Equilíbrio & Verdade',    img: 'assets/cartas/RWS1909_-_11_Justice.jpeg' },
  { number: 12, name: 'O Enforcado',       aliases: ['o pendurado'],                     keyword: 'Pausa & Rendição',        img: 'assets/cartas/RWS1909_-_12_Hanged_Man.jpeg' },
  { number: 13, name: 'A Morte',           aliases: [],                                  keyword: 'Transformação & Fim',     img: 'assets/cartas/RWS1909_-_13_Death.jpeg' },
  { number: 14, name: 'A Temperança',      aliases: [],                                  keyword: 'Harmonia & Paciência',    img: 'assets/cartas/RWS1909_-_14_Temperance.jpeg' },
  { number: 15, name: 'O Diabo',           aliases: [],                                  keyword: 'Sombra & Apego',          img: 'assets/cartas/RWS1909_-_15_Devil.jpeg' },
  { number: 16, name: 'A Torre',           aliases: [],                                  keyword: 'Ruptura & Revelação',     img: 'assets/cartas/RWS1909_-_16_Tower.jpeg' },
  { number: 17, name: 'A Estrela',         aliases: [],                                  keyword: 'Esperança & Cura',        img: 'assets/cartas/RWS1909_-_17_Star.jpeg' },
  { number: 18, name: 'A Lua',             aliases: [],                                  keyword: 'Ilusão & Inconsciente',   img: 'assets/cartas/RWS1909_-_18_Moon.jpeg' },
  { number: 19, name: 'O Sol',             aliases: [],                                  keyword: 'Alegria & Clareza',       img: 'assets/cartas/RWS1909_-_19_Sun.jpeg' },
  { number: 20, name: 'O Julgamento',      aliases: ['o juízo'],                         keyword: 'Renascimento & Chamado',  img: 'assets/cartas/RWS1909_-_20_Judgement.jpeg' },
  { number: 21, name: 'O Mundo',           aliases: [],                                  keyword: 'Completude & Êxito',      img: 'assets/cartas/RWS1909_-_21_World.jpeg' },
];

/**
 * Busca um arcano pelo nome, tolerante a aliases e variações
 */
export function findArcanaByName(cardName) {
  if (!cardName) return null;
  const norm = cardName.toLowerCase().trim();
  return MAJOR_ARCANA.find(a =>
    a.name.toLowerCase() === norm ||
    (a.aliases || []).includes(norm) ||
    norm.includes(a.name.toLowerCase()) ||
    a.name.toLowerCase().includes(norm)
  ) ?? null;
}

/**
 * Retorna o arcano correspondente a um número (reduz até 0–21)
 * Números > 21 são reduzidos somando os dígitos
 */
export function getArcana(n) {
  if (n == null) return null;
  let num = Number(n);
  while (num > 21) {
    num = String(num).split('').reduce((acc, d) => acc + Number(d), 0);
  }
  return MAJOR_ARCANA[num] ?? null;
}

/**
 * Calcula o Arcano do Ano pessoal:
 * dia + mês de nascimento + ano atual, somado até ≤ 21
 */
export function getYearArcana(birthDateStr) {
  if (!birthDateStr) return null;
  const [, month, day] = birthDateStr.split('-').map(Number);
  const year = new Date().getFullYear();
  const sum = day + month + Math.floor(year / 1000) + Math.floor((year % 1000) / 100) + Math.floor((year % 100) / 10) + (year % 10);
  return getArcana(sum);
}

/**
 * Retorna a URL pública da imagem
 */
export function getArcanaImageUrl(img) {
  if (!img) return null;
  return `${import.meta.env.BASE_URL}${img.startsWith('/') ? img.slice(1) : img}`;
}
