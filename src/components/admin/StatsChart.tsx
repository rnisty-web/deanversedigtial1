"use client";

import dynamic from "next/dynamic";
import {
  chartHasData,
  type StatsChartProps,
} from "@/components/admin/StatsChartInner";

export type { StatsChartProps } from "@/components/admin/StatsChartInner";

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      style={{ height }}
      className="flex w-full animate-pulse items-center justify-center rounded-lg border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)]"
      aria-hidden
    >
      <div className="h-3 w-24 rounded-full bg-white/10" />
    </div>
  );
}

const StatsChartInner = dynamic(
  () => import("@/components/admin/StatsChartInner").then((mod) => mod.StatsChartInner),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={280} />,
  },
);

export function StatsChart({
  height = 280,
  emptyMessage = "No data yet.",
  labels,
  datasets,
  ...rest
}: StatsChartProps) {
  if (!chartHasData(labels, datasets)) {
    return (
      <div
        style={{ height }}
        className="flex w-full items-center justify-center rounded-lg border border-dashed border-[var(--admin-border-subtle)] bg-[var(--admin-panel)]"
      >
        <p className="text-sm text-[var(--admin-text-muted)]">{emptyMessage}</p>
      </div>
    );
  }

  return <StatsChartInner height={height} labels={labels} datasets={datasets} {...rest} />;
}
