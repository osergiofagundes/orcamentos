'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ProdutosServicosChartProps {
  data: Array<{
    tipo: string
    quantidade: number
  }>
}

const COLORS = {
  PRODUTO: '#0088FE',
  SERVICO: '#00C49F'
}

const TIPO_LABELS = {
  PRODUTO: 'Produtos',
  SERVICO: 'Serviços'
}

export function ProdutosServicosChart({ data }: ProdutosServicosChartProps) {
  const chartData = data.map(item => ({
    ...item,
    name: TIPO_LABELS[item.tipo as keyof typeof TIPO_LABELS] || item.tipo,
    fill: COLORS[item.tipo as keyof typeof COLORS] || '#8884d8'
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos vs Serviços</CardTitle>
        <CardDescription>
          Distribuição entre produtos e serviços cadastrados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="quantidade"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
