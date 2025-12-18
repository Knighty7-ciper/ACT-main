"use client"
import { Line, Bar, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { cn } from "@/lib/utils"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

interface ChartProps {
  type: "line" | "bar" | "pie"
  data: any
  options?: any
  className?: string
  height?: number
}

export function Chart({ type, data, options, className, height = 300 }: ChartProps) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    ...options,
  }

  const ChartComponent = type === "line" ? Line : type === "bar" ? Bar : Pie

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ChartComponent data={data} options={defaultOptions} />
    </div>
  )
}
