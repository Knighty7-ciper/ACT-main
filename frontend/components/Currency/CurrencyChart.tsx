"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart } from "@/components/UI/Chart"

interface CurrencyChartProps {
  currencyCode: string
  data: {
    labels: string[]
    values: number[]
  }
}

export function CurrencyChart({ currencyCode, data }: CurrencyChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: `${currencyCode} Exchange Rate`,
        data: data.values,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{currencyCode} Price Chart</CardTitle>
        <CardDescription>Historical exchange rate data</CardDescription>
      </CardHeader>
      <CardContent>
        <Chart type="line" data={chartData} height={300} />
      </CardContent>
    </Card>
  )
}
