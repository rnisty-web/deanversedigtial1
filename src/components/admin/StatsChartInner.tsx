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

const ADMIN_EMERALD = "#6f8f72";
const ADMIN_GOLD = "#c9a962";
const ADMIN_GOLD_LIGHT = "#dfc88a";
const ADMIN_EMERALD_DEEP = "#2f5d50";

const chartDefaults = {
  color: "rgba(245, 242, 235, 0.55)",
  borderColor: "rgba(201, 169, 98, 0.12)",
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

function luxuryLineFill(context: { chart: ChartJS }) {
  const chart = context.chart;
  const { ctx, chartArea } = chart;
  if (!chartArea) return "rgba(111, 143, 114, 0.2)";
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, "rgba(111, 143, 114, 0.48)");
  gradient.addColorStop(0.55, "rgba(47, 93, 80, 0.18)");
  gradient.addColorStop(1, "rgba(47, 93, 80, 0.02)");
  return gradient;
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

  const data = {
    labels,
    datasets: datasets.map((ds) => ({
      ...ds,
      backgroundColor:
        ds.backgroundColor ??
        (type === "doughnut"
          ? [ADMIN_EMERALD, ADMIN_GOLD_LIGHT, ADMIN_EMERALD_DEEP, "#5a7560", ADMIN_GOLD]
          : isLuxury && type === "line"
            ? luxuryLineFill
            : "rgba(111, 143, 114, 0.2)"),
      borderColor: ds.borderColor ?? (isLuxury && type === "line" ? ADMIN_GOLD : ADMIN_GOLD),
      borderWidth: type === "doughnut" ? 0 : isLuxury && type === "line" ? 2.5 : 2,
      tension: 0.4,
      fill: ds.fill ?? type === "line",
      ...(isLuxury && type === "line"
        ? {
            pointBackgroundColor: ADMIN_GOLD,
            pointBorderColor: ADMIN_GOLD_LIGHT,
            pointHoverBackgroundColor: ADMIN_GOLD_LIGHT,
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
              grid: { color: chartDefaults.borderColor },
            },
            y: {
              ticks: {
                color: chartDefaults.color,
                maxTicksLimit: 6,
                font: { size: 11 },
              },
              grid: { color: chartDefaults.borderColor },
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
