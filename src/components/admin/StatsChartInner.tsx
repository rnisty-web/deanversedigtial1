"use client";

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
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { getAdminChartPalette, withAlpha } from "@/lib/admin/theme-colors";

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
);

const chartDefaults = {
  color: "rgba(245, 242, 235, 0.55)",
};

export type ChartType = "line" | "bar" | "doughnut";

export interface StatsChartProps {
  type: ChartType;
  title?: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    fill?: boolean;
  }[];
  height?: number;
  emptyMessage?: string;
  variant?: "default" | "luxury";
  hideLegend?: boolean;
}

function luxuryLineFill(emerald: string, emeraldDeep: string) {
  return (context: { chart: ChartJS }) => {
    const chart = context.chart;
    const { ctx, chartArea } = chart;
    if (!chartArea) return withAlpha(emerald, 0.2);
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, withAlpha(emerald, 0.48));
    gradient.addColorStop(0.55, withAlpha(emeraldDeep, 0.18));
    gradient.addColorStop(1, withAlpha(emeraldDeep, 0.02));
    return gradient;
  };
}

export function chartHasData(labels: string[], datasets: StatsChartProps["datasets"]) {
  return (
    labels.length > 0 &&
    datasets.some((ds) => ds.data.length > 0 && ds.data.some((n) => n > 0))
  );
}

export function StatsChartInner({
  type,
  title,
  labels,
  datasets,
  height = 280,
  variant = "default",
  hideLegend = false,
}: StatsChartProps) {
  const isLuxury = variant === "luxury";
  const palette = getAdminChartPalette();

  const data = {
    labels,
    datasets: datasets.map((ds) => ({
      ...ds,
      backgroundColor:
        ds.backgroundColor ??
        (type === "doughnut"
          ? [
              palette.emerald,
              palette.goldLight,
              palette.emeraldDeep,
              withAlpha(palette.emerald, 0.65),
              palette.gold,
            ]
          : isLuxury && type === "line"
            ? luxuryLineFill(palette.emerald, palette.emeraldDeep)
            : withAlpha(palette.emerald, 0.2)),
      borderColor: ds.borderColor ?? palette.gold,
      borderWidth: type === "doughnut" ? 0 : isLuxury && type === "line" ? 2.5 : 2,
      tension: 0.4,
      fill: ds.fill ?? type === "line",
      ...(isLuxury && type === "line"
        ? {
            pointBackgroundColor: palette.gold,
            pointBorderColor: palette.goldLight,
            pointHoverBackgroundColor: palette.goldLight,
            pointHoverBorderColor: "#fff",
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBorderWidth: 2,
            pointHoverBorderWidth: 2,
          }
        : {}),
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: hideLegend
        ? { display: false }
        : {
            labels: { color: chartDefaults.color },
          },
      title: title
        ? {
            display: true,
            text: title,
            color: "var(--admin-text)",
            font: { size: 14 },
          }
        : { display: false },
    },
    scales:
      type !== "doughnut"
        ? {
            x: {
              ticks: {
                color: chartDefaults.color,
                maxRotation: 45,
                minRotation: 0,
                autoSkip: true,
                maxTicksLimit: 8,
                font: { size: 11 },
              },
              grid: { color: withAlpha(palette.gold, 0.12) },
            },
            y: {
              ticks: {
                color: chartDefaults.color,
                maxTicksLimit: 6,
                font: { size: 11 },
              },
              grid: { color: withAlpha(palette.gold, 0.12) },
              beginAtZero: true,
            },
          }
        : undefined,
  };

  return (
    <div style={{ height }} className="w-full">
      {type === "line" && <Line data={data} options={options} />}
      {type === "bar" && <Bar data={data} options={options} />}
      {type === "doughnut" && <Doughnut data={data} options={options} />}
    </div>
  );
}
