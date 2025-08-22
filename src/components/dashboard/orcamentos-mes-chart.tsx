'use client'

import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface OrcamentosMesChartProps {
  data: Array<{
    mes: string
    quantidade: number
    valor: number
  }>
}

export function OrcamentosMesChart({ data }: OrcamentosMesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Orçamentos por Mês</CardTitle>
        <CardDescription>
          Evolução dos orçamentos nos últimos meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'valor') {
                  return [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor Total']
                }
                return [value, 'Quantidade']
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="quantidade" fill="#8884d8" name="Quantidade" />
            <Line yAxisId="right" type="monotone" dataKey="valor" stroke="#82ca9d" strokeWidth={2} name="Valor (R$)" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
