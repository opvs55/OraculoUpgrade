// src/data/arcanosMenores.js
// Arcanos Menores - Paus, Copas, Espadas, Ouros

const criarCartas = (naipe, elemento, tipo) => {
  const cartas = [];
  const nomes = {
    Paus: ['Ás de Paus', 'Dois de Paus', 'Três de Paus', 'Quatro de Paus', 'Cinco de Paus', 'Seis de Paus', 'Sete de Paus', 'Oito de Paus', 'Nove de Paus', 'Dez de Paus', 'Valete de Paus', 'Cavaleiro de Paus', 'Rainha de Paus', 'Rei de Paus'],
    Copas: ['Ás de Copas', 'Dois de Copas', 'Três de Copas', 'Quatro de Copas', 'Cinco de Copas', 'Seis de Copas', 'Sete de Copas', 'Oito de Copas', 'Nove de Copas', 'Dez de Copas', 'Valete de Copas', 'Cavaleiro de Copas', 'Rainha de Copas', 'Rei de Copas'],
    Espadas: ['Ás de Espadas', 'Dois de Espadas', 'Três de Espadas', 'Quatro de Espadas', 'Cinco de Espadas', 'Seis de Espadas', 'Sete de Espadas', 'Oito de Espadas', 'Nove de Espadas', 'Dez de Espadas', 'Valete de Espadas', 'Cavaleiro de Espadas', 'Rainha de Espadas', 'Rei de Espadas'],
    Ouros: ['Ás de Ouros', 'Dois de Ouros', 'Três de Ouros', 'Quatro de Ouros', 'Cinco de Ouros', 'Seis de Ouros', 'Sete de Ouros', 'Oito de Ouros', 'Nove de Ouros', 'Dez de Ouros', 'Valete de Ouros', 'Cavaleiro de Ouros', 'Rainha de Ouros', 'Rei de Ouros']
  };

  const slugs = {
    Paus: ['as-paus', 'dois-paus', 'tres-paus', 'quatro-paus', 'cinco-paus', 'seis-paus', 'sete-paus', 'oito-paus', 'nove-paus', 'dez-paus', 'valete-paus', 'cavaleiro-paus', 'rainha-paus', 'rei-paus'],
    Copas: ['as-copas', 'dois-copas', 'tres-copas', 'quatro-copas', 'cinco-copas', 'seis-copas', 'sete-copas', 'oito-copas', 'nove-copas', 'dez-copas', 'valete-copas', 'cavaleiro-copas', 'rainha-copas', 'rei-copas'],
    Espadas: ['as-espadas', 'dois-espadas', 'tres-espadas', 'quatro-espadas', 'cinco-espadas', 'seis-espadas', 'sete-espadas', 'oito-espadas', 'nove-espadas', 'dez-espadas', 'valete-espadas', 'cavaleiro-espadas', 'rainha-espadas', 'rei-espadas'],
    Ouros: ['as-ouros', 'dois-ouros', 'tres-ouros', 'quatro-ouros', 'cinco-ouros', 'seis-ouros', 'sete-ouros', 'oito-ouros', 'nove-ouros', 'dez-ouros', 'valete-ouros', 'cavaleiro-ouros', 'rainha-ouros', 'rei-ouros']
  };

  const rweNames = {
    Paus: 'Wands',
    Copas: 'Cups',
    Espadas: 'Swords',
    Ouros: 'Pentacles',
  };

  const descricoes = {
    Paus: {
      geral: "O naipe de Paus representa a energia do fogo, criatividade, paixão, ação e inspiração. Estas cartas estão conectadas com a nossa força vital, ambições e capacidade de manifestar nossos desejos através da ação direta.",
      numeros: "Representam diferentes estágios da manifestação criativa e da energia em ação.",
      cortes: "Representam pessoas que personificam as qualidades dos Paus: criativas, passionais, líderes naturais e cheias de energia."
    },
    Copas: {
      geral: "O naipe de Copas representa a energia da água, emoções, relacionamentos, amor e intuição. Estas cartas estão conectadas com nosso mundo emocional, nossos sentimentos mais profundos e nossa capacidade de amar e nos conectar com os outros.",
      numeros: "Representam diferentes aspectos da experiência emocional e dos relacionamentos.",
      cortes: "Representam pessoas que personificam as qualidades das Copas: emocionais, intuitivas, empáticas e profundamente conectadas com seus sentimentos."
    },
    Espadas: {
      geral: "O naipe de Espadas representa a energia do ar, intelecto, comunicação, verdade e conflito. Estas cartas estão conectadas com nossa mente, nossa capacidade de pensar claramente, comunicar ideias e enfrentar desafios mentais.",
      numeros: "Representam diferentes estados mentais e situações que exigem clareza de pensamento.",
      cortes: "Representam pessoas que personificam as qualidades das Espadas: intelectuais, comunicativas, analíticas e diretas."
    },
    Ouros: {
      geral: "O naipe de Ouros representa a energia da terra, materialidade, segurança, trabalho e abundância. Estas cartas estão conectadas com nosso mundo físico, nossas posses, nossa saúde e nossa capacidade de manifestar segurança material.",
      numeros: "Representam diferentes aspectos da experiência material e da segurança financeira.",
      cortes: "Representam pessoas que personificam as qualidades dos Ouros: práticas, estáveis, trabalhadoras e conectadas com o mundo material."
    }
  };

  for (let i = 0; i < 14; i++) {
    const id = (tipo === 'Paus' ? 22 : tipo === 'Copas' ? 36 : tipo === 'Espadas' ? 50 : 64) + i;
    const numero = i + 1;
    const ehCorte = i >= 10; // Valete, Cavaleiro, Rainha, Rei
    
    cartas.push({
      id,
      slug: slugs[naipe][i],
      nome: nomes[naipe][i],
      img: `/assets/cartas/RWS1909_-_${rweNames[naipe]}_${String(numero).padStart(2, '0')}.jpeg`,
      video: `/assets/videos/${slugs[naipe][i]}.mp4`,
      tipo: "Arcano Menor",
      naipe: tipo,
      elemento: elemento,
      descricao: `${descricoes[naipe].geral} ${ehCorte ? descricoes[naipe].cortes : descricoes[naipe].numeros}`,
      palavras_chave: {
        direito: [`Palavra-chave ${numero} ${naipe}`, `Qualidade ${elemento}`, `Energia ${tipo.toLowerCase()}`],
        invertido: [`Bloqueio ${naipe}`, `Desequilíbrio ${elemento}`, `Desafio ${tipo.toLowerCase()}`]
      },
      significados: {
        direito: `Quando ${nomes[naipe][i]} aparece direito, ele traz a energia positiva do elemento ${elemento} e do naipe ${tipo}. Representa um momento favorável relacionado a ${descricoes[naipe].geral.toLowerCase()}.`,
        invertido: `Invertido, ${nomes[naipe][i]} pode indicar bloqueios ou desafios relacionados à energia do ${elemento} e às qualidades do naipe ${tipo}. Sugere a necessidade de atenção e equilíbrio nesta área.`
      }
    });
  }

  return cartas;
};

export const arcanosMenores = {
  Paus: criarCartas('Paus', 'Fogo', 'Paus'),
  Copas: criarCartas('Copas', 'Água', 'Copas'),
  Espadas: criarCartas('Espadas', 'Ar', 'Espadas'),
  Ouros: criarCartas('Ouros', 'Terra', 'Ouros')
};
