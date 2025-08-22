'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface OrcamentosStatusChartProps {
  data: Array<{
    status: string
    quantidade: number
  }>
}

const COLORS = {
  RASCUNHO: '#8884d8',
  ENVIADO: '#82ca9d', 
  APROVADO: '#00C49F',
  REJEITADO: '#FF8042',
  CANCELADO: '#FFBB28'
}

const STATUS_LABELS = {
  RASCUNHO: 'Rascunho',
  ENVIADO: 'Enviado',
  APROVADO: 'Aprovado', 
  REJEITADO: 'Rejeitado',
  CANCELADO: 'Cancelado'
}

export function OrcamentosStatusChart({ data }: OrcamentosStatusChartProps) {
  const chartData = data.map(item => ({
    ...item,
    name: STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status,
    fill: COLORS[item.status as keyof typeof COLORS] || '#8884d8'
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orçamentos por Status</CardTitle>
        <CardDescription>
          Distribuição dos orçamentos por status atual
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
