const SPREAD_TYPE_LABELS = {
  celticCross: 'Cruz Celta',
  threeCards: 'Três Cartas',
  templeOfAphrodite: 'Templo de Afrodite',
  pathChoice: 'Escolha de Caminho',
};

export function formatSpreadType(spreadType) {
  return SPREAD_TYPE_LABELS[spreadType] || spreadType;
}
