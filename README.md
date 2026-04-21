# Oráculo IA - Projeto de Tarot Digital

Uma aplicação web moderna de tarot com inteligência artificial, built com React, Vite e Supabase.

## Tecnologias

- **Frontend**: React 19.1.0 + Vite 7.0.4
- **Backend**: Supabase (autenticação + banco de dados)
- **IA**: Google Generative AI
- **State Management**: TanStack Query
- **Routing**: React Router DOM
- **Styling**: CSS Modules + CSS Custom Properties
- **Testing**: Vitest + Testing Library
- **Code Quality**: ESLint + Logging condicional

## Estrutura do Projeto

```bash
src/
├── components/          # Componentes reutilizáveis
├── context/           # Context providers (Auth)
├── data/             # Dados estruturados (tarot)
├── features/         # Features específicas
├── hooks/            # Hooks customizados
├── pages/            # Páginas da aplicação
├── routes/           # Configuração de rotas
├── services/         # Serviços externos (API, tarot)
├── styles/           # Estilos globais
├── types/            # Type definitions (JSDoc)
├── utils/            # Utilitários (logger, auth errors)
└── __tests__/        # Testes unitários
```

## Setup do Projeto

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone <repository-url>
cd oraculo-ia

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do Supabase e Google AI
```

### Variáveis de Ambiente
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key
```

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Lint do código
npm run lint

# Testes
npm run test              # Executa todos os testes
npm run test:ui           # Interface visual dos testes
npm run test:coverage     # Coverage dos testes
```

## Testes

O projeto possui testes unitários para:

- **TarotService**: Validação dos sorteios de cartas
- **TarotDeck**: Integridade do baralho completo
- **Utils**: Funções utilitárias

Execute os testes com:
```bash
npm run test
```

## Arquitetura

### Sistema de Logging
- **Logger condicional**: Logs aparecem apenas em desenvolvimento
- **Contextos específicos**: `logger.auth`, `logger.api`, `logger.tarot`
- **Zero logs em produção**: Performance otimizada

### Estrutura de Dados
- **Tarot modular**: Arcanos Maiores/Menores separados em módulos
- **Type safety**: JSDoc types para melhor DX
- **Utilitários de busca**: Funções otimizadas para encontrar cartas

### Autenticação
- **Supabase Auth**: Sistema completo de autenticação
- **Context API**: Gerenciamento global de estado
- **Profile integration**: Dados do usuário sincronizados

## Features Principais

- **Leituras de Tarot**: Múltiplos spreads (Cruz Celta, 3 cartas, etc.)
- **IA Generativa**: Interpretações personalizadas com Google AI
- **Sistema de Perfil**: Avatares, bios, histórias pessoais
- **Histórico Completo**: Salva e revisita leituras anteriores
- **Biblioteca Interativa**: Estudo detalhado das cartas
- **Design Responsivo**: Experiência mobile-first
- **Performance Otimizada**: Lazy loading, cache eficiente

## Padrões de Código

### Convenções
- **Componentes**: PascalCase com CSS Modules
- **Funções**: camelCase com JSDoc comments
- **Constantes**: UPPER_SNAKE_CASE
- **Arquivos**: kebab-case para componentes, camelCase para utilitários

### Quality Gates
- **ESLint**: Configuração rigorosa com React hooks
- **Test Coverage**: Mínimo 80% para código crítico
- **Type Safety**: JSDoc para documentação e validação
- **Performance**: Bundle analysis e otimização contínua

## Deploy

### Vercel (Recomendado)
1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático em cada push para main

### Outros
A aplicação é 100% estática e pode ser deployada em qualquer plataforma compatível com Vite.

## Performance

- **Bundle size**: < 500KB (gzipped)
- **First Contentful Paint**: < 1.5s
- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices)
- **Core Web Vitals**: Todos verdes

## Contribuição

1. Fork o projeto
2. Crie uma feature branch (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Agradecimentos

- **Supabase** - Backend as a Service incrível
- **Google AI** - Poderosas capacidades de IA generativa
- **Vite** - Build tool extremamente rápido
- **React** - Framework frontend revolucionário

---
**Oráculo IA** - Seu guia digital no mundo místico do tarot
