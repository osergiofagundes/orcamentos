# Dashboard de Orçamentos

Este dashboard foi criado para fornecer uma visão geral completa e interativa do desempenho do sistema de orçamentos.

## 📊 Funcionalidades

### Cards de Estatísticas
- **Total de Clientes**: Número de clientes cadastrados
- **Produtos/Serviços**: Quantidade de itens disponíveis no catálogo
- **Total de Orçamentos**: Todos os orçamentos criados
- **Taxa de Aprovação**: Percentual de orçamentos aprovados
- **Orçamentos Aprovados**: Quantidade de orçamentos com status aprovado
- **Orçamentos Pendentes**: Orçamentos aguardando resposta (status: ENVIADO)
- **Valor Total Aprovado**: Receita total dos orçamentos aprovados

### Gráficos e Visualizações

#### 1. **Resumo Mensal** (Card lateral)
- Visão consolidada dos dados principais
- Status dos orçamentos com badges coloridas
- Taxa de aprovação e receita destacadas

#### 2. **Orçamentos por Status** (Gráfico de Pizza)
- Distribuição visual dos orçamentos por status
- Cores diferenciadas para cada status:
  - Rascunho: Secundário
  - Enviado: Padrão  
  - Aprovado: Verde
  - Rejeitado: Vermelho
  - Cancelado: Amarelo

#### 3. **Produtos vs Serviços** (Gráfico de Pizza)
- Comparação entre produtos físicos e serviços
- Cores distintas para fácil identificação

#### 4. **Evolução Mensal** (Gráfico Combinado)
- Linha mostrando evolução do valor em reais
- Barras mostrando quantidade de orçamentos
- Dados dos últimos 6 meses

#### 5. **Top 5 Produtos/Serviços** (Gráfico de Barras Horizontal)
- Produtos e serviços mais utilizados nos orçamentos
- Baseado na quantidade total usada

#### 6. **Orçamentos Recentes** (Tabela)
- Últimos 10 orçamentos criados
- Informações: Cliente, Valor, Status, Data
- Status com badges coloridas

## 🛠 Tecnologias Utilizadas

- **Frontend**: React, Next.js, TypeScript
- **Gráficos**: Recharts
- **Styling**: Tailwind CSS, Shadcn/UI
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM com PostgreSQL

## 📁 Estrutura de Arquivos

```
src/
├── app/
│   ├── api/dashboard/
│   │   ├── stats/route.ts                    # API principal de estatísticas
│   │   └── orcamentos-recentes/route.ts      # API para orçamentos recentes
│   └── (workspace)/[workspaceId]/dashboard/
│       └── page.tsx                          # Página principal do dashboard
├── components/dashboard/
│   ├── stats-card.tsx                        # Card de estatísticas
│   ├── orcamentos-status-chart.tsx           # Gráfico de pizza por status
│   ├── orcamentos-mes-chart.tsx              # Gráfico combinado mensal
│   ├── top-produtos-chart.tsx                # Gráfico top produtos
│   ├── produtos-servicos-chart.tsx           # Gráfico produtos vs serviços
│   ├── resumo-mensal.tsx                     # Card de resumo
│   └── orcamentos-recentes-table.tsx         # Tabela de orçamentos recentes
├── hooks/
│   └── use-dashboard-data.ts                 # Hook para buscar dados
└── prisma/
    ├── seed-example-data.ts                  # Seed de dados básicos
    └── seed-dashboard-data.ts                # Seed de orçamentos para dashboard
```

## 🎨 Design e UX

### Responsividade
- Layout adaptável para desktop, tablet e mobile
- Grid responsivo que se adapta ao tamanho da tela
- Componentes otimizados para diferentes resoluções

### Estados de Carregamento
- Skeleton loaders em todos os componentes
- Indicadores visuais durante carregamento dos dados
- Tratamento de erros com mensagens informativas

### Cores e Temas
- Paleta de cores consistente
- Suporte ao sistema de temas do Shadcn/UI
- Cores semânticas para status (verde=aprovado, vermelho=rejeitado, etc.)

## 🚀 Como Usar

### Configuração Inicial
1. Execute os seeds para criar dados de exemplo:
   ```bash
   npx tsx prisma/seed-example-data.ts
   npx tsx prisma/seed-dashboard-data.ts
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Acesse o dashboard:
   ```
   http://localhost:3000/[workspaceId]/dashboard
   ```

### Personalização
- **Cores**: Modifique as cores dos gráficos em cada componente
- **Períodos**: Ajuste o período dos gráficos temporais na API
- **Métricas**: Adicione novas estatísticas na API de stats
- **Filtros**: Implemente filtros por período, cliente, etc.

## 📈 Métricas Calculadas

### Taxa de Aprovação
```typescript
(orçamentos aprovados / total de orçamentos) * 100
```

### Evolução Mensal
- Agrupa orçamentos por mês dos últimos 6 meses
- Calcula quantidade e soma valores por mês
- Preenche meses sem dados com valores zero

### Top Produtos
- Agrupa itens de orçamento por produto/serviço
- Soma quantidades utilizadas
- Ordena por quantidade decrescente

## 🔄 Atualizações Futuras

### Funcionalidades Planejadas
- [ ] Filtros por período personalizado
- [ ] Exportação de relatórios em PDF/Excel
- [ ] Comparação entre períodos
- [ ] Metas e objetivos
- [ ] Notificações de tendências
- [ ] Dashboard por usuário
- [ ] Previsões baseadas em dados históricos

### Melhorias Técnicas
- [ ] Cache de dados para melhor performance
- [ ] Lazy loading dos gráficos
- [ ] Modo offline com dados locais
- [ ] Testes automatizados
- [ ] Otimização de queries do banco

## 📊 Análises Disponíveis

O dashboard permite análises de:
- **Performance de vendas**: Taxa de conversão, valores médios
- **Tendências temporais**: Sazonalidade, crescimento mensal
- **Produtos populares**: Itens mais vendidos, categorias top
- **Eficiência operacional**: Tempo de resposta, taxa de rejeição
- **Insights de clientes**: Clientes mais ativos, ticket médio
