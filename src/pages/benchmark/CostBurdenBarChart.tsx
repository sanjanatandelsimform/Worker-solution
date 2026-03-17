import { useEffect, useRef, useState } from "react";

interface ChartDataItem {
  label: string;
  sublabel: string;
  value1: number;
  value2: number;
}

interface CanvasChartProps {
  readonly data: ChartDataItem[];
  readonly width?: number;
  readonly height?: number;
}

interface TooltipData {
  x: number;
  y: number;
  label: string;
  value: number;
  color: string;
}

const PLACEHOLDER_CHART_DATA: ChartDataItem[] = [
  { label: "Low income", sublabel: "--", value1: 0, value2: 0 },
  { label: "Moderate income", sublabel: "--", value1: 0, value2: 0 },
  { label: "Median income", sublabel: "--", value1: 0, value2: 0 },
  { label: "Upper income", sublabel: "--", value1: 0, value2: 0 },
];

export default function CostBurdenBarChart({ data, width, height = 400 }: CanvasChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(width || 800);

  useEffect(() => {
    if (!width && containerRef.current) {
      const updateWidth = () => {
        if (containerRef.current) {
          setCanvasWidth(containerRef.current.offsetWidth);
        }
      };
      updateWidth();
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }
  }, [width]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, canvasWidth, height);

    const padding = { top: 50, right: 30, bottom: 80, left: 60 };
    const chartWidth = canvasWidth - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const hasData = data.length > 0 && data.some(item => item.value1 > 0 || item.value2 > 0);

    const renderData = hasData ? data : PLACEHOLDER_CHART_DATA;
    const numGroups = renderData.length;

    const maxValue = hasData ? Math.max(...data.map(item => item.value1 + item.value2)) : 100;
    const yScale = chartHeight / maxValue;

    // ── Bar dimensions ────────────────────────────────────────────────
    // Real data: fixed 128px width
    // Placeholder: Figma spec — 70px wide, 280px tall
    const realBarWidth = 128;
    const placeholderBarWidth = 70; // ← Figma: width: 70px
    const PLACEHOLDER_BAR_HEIGHT = Math.min(280, chartHeight); // ← Figma: height: 280px

    const barWidth = hasData ? realBarWidth : placeholderBarWidth;

    const totalBarsWidth = barWidth * numGroups;
    const availableSpaceForGaps = chartWidth - totalBarsWidth;
    const barSpacing = numGroups > 1 ? availableSpaceForGaps / (numGroups + 1) : 0;
    const barGap = 18;

    const color1 = "#6dc5d3";
    const color2 = "#a5f0fc";
    const textColor = "#000000";
    const gridLineColor = "#ccc";

    // ── Grid lines + Y-axis labels (always rendered) ──────────────────
    ctx.strokeStyle = gridLineColor;
    ctx.lineWidth = 1;
    ctx.font = "400 14px Inter, sans-serif";
    ctx.fillStyle = "#6b7280";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    const gridSteps = 5;
    for (let i = 0; i <= gridSteps; i++) {
      const y = padding.top + (chartHeight * i) / gridSteps;
      const value = Math.round(maxValue * (1 - i / gridSteps));
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(canvasWidth - padding.right, y);
      ctx.stroke();
      ctx.fillText(`${value}%`, padding.left - 10, y);
    }

    // ── Bars + labels ─────────────────────────────────────────────────
    renderData.forEach((item, index) => {
      const x =
        numGroups > 1
          ? padding.left + barSpacing + index * (barWidth + barSpacing)
          : padding.left + (chartWidth - barWidth) / 2;
      const baseY = padding.top + chartHeight;

      if (!hasData) {
        // ── Figma placeholder: 70×280px grey bar ──────────────────────
        ctx.fillStyle = "#F5F5F5";
        ctx.globalAlpha = 1;
        ctx.fillRect(x, baseY - PLACEHOLDER_BAR_HEIGHT, barWidth, PLACEHOLDER_BAR_HEIGHT);
        ctx.strokeStyle = "#F5F5F5";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, baseY - PLACEHOLDER_BAR_HEIGHT, barWidth, PLACEHOLDER_BAR_HEIGHT);
      } else {
        // ── Real data bars (unchanged) ────────────────────────────────
        const bar1Height = item.value1 * yScale;
        const bar2Height = item.value2 * yScale;

        ctx.fillStyle = color1;
        ctx.globalAlpha = 1;
        ctx.fillRect(x, baseY - bar1Height, barWidth, bar1Height);

        if (item.value2 > 0) {
          ctx.fillStyle = color2;
          const bar2Width = barWidth - barGap * 2;
          ctx.fillRect(x + barGap, baseY - bar2Height, bar2Width, bar2Height);
        }

        ctx.fillStyle = textColor;
        ctx.font = "500 14px Inter, sans-serif";
        ctx.textAlign = "center";

        const minLabelSpace = 25;
        const value1Y = baseY - bar1Height - 8;
        const chartTop = padding.top;

        if (value1Y < chartTop + minLabelSpace) {
          ctx.textBaseline = "top";
          ctx.fillText(`${item.value1}%`, x + barWidth / 2, baseY - bar1Height + 8);
        } else {
          ctx.textBaseline = "bottom";
          ctx.fillText(`${item.value1}%`, x + barWidth / 2, value1Y);
        }

        if (item.value2 > 0) {
          const value2Y = baseY - bar2Height - 8;
          if (value2Y < chartTop + minLabelSpace) {
            ctx.textBaseline = "top";
            ctx.fillText(`${item.value2}%`, x + barWidth / 2, baseY - bar2Height + 8);
          } else {
            ctx.textBaseline = "bottom";
            ctx.fillText(`${item.value2}%`, x + barWidth / 2, value2Y);
          }
        }
      }

      // ── Category label + sublabel (always rendered) ───────────────
      ctx.globalAlpha = 1;
      ctx.font = "500 14px Inter, sans-serif";
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      const labelY = baseY + 12;
      ctx.fillText(item.label, x + barWidth / 2, labelY);

      ctx.font = "400 14px Inter, sans-serif";
      ctx.fillStyle = textColor;
      ctx.fillText(item.sublabel, x + barWidth / 2, labelY + 24);
    });
  }, [data, canvasWidth, height]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const hasData = data.length > 0 && data.some(item => item.value1 > 0 || item.value2 > 0);
    if (!hasData) {
      setTooltip(null);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const padding = { top: 60, right: 100, bottom: 80, left: 60 };
    const chartWidth = canvasWidth - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const maxValue = Math.max(...data.map(item => item.value1 + item.value2));
    const yScale = chartHeight / maxValue;
    const barWidth = 128;
    const totalBarsWidth = barWidth * data.length;
    const availableSpaceForGaps = chartWidth - totalBarsWidth;
    const barSpacing = data.length > 1 ? availableSpaceForGaps / (data.length + 1) : 0;
    const barGap = 18;

    let foundTooltip: TooltipData | null = null;

    data.forEach((item, index) => {
      const x =
        data.length > 1
          ? padding.left + barSpacing + index * (barWidth + barSpacing)
          : padding.left + (chartWidth - barWidth) / 2;
      const baseY = padding.top + chartHeight;
      const bar1Height = item.value1 * yScale;
      const bar2Height = item.value2 * yScale;

      if (
        mouseX >= x &&
        mouseX <= x + barWidth &&
        mouseY >= baseY - bar1Height &&
        mouseY <= baseY
      ) {
        const isOverLighterBar =
          item.value2 > 0 &&
          mouseX >= x + barGap &&
          mouseX <= x + barWidth - barGap &&
          mouseY >= baseY - bar2Height &&
          mouseY <= baseY;

        foundTooltip = {
          x: mouseX,
          y: mouseY,
          label: item.sublabel,
          value: isOverLighterBar ? item.value2 : item.value1,
          color: isOverLighterBar ? "#a5f0fc" : "#6dc5d3",
        };
      }
    });

    setTooltip(foundTooltip);
  };

  const handleMouseLeave = () => setTooltip(null);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas
        ref={canvasRef}
        className="block w-full"
        style={{ width: `${canvasWidth}px`, height: `${height}px` }}
      />
      {tooltip && (
        <div
          className="pointer-events-none absolute rounded-lg border border-gray-200 bg-ws-white px-3 py-2 shadow-lg"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y - 10}px`,
            transform: "translateY(-100%)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: tooltip.color }} />
            <div className="text-sm">
              <div className="font-medium text-ws-black-90">{tooltip.value}%</div>
              <div className="text-xs text-ws-gray-100">{tooltip.label}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function IncomeDistributionChart({
  data,
}: {
  data?: Array<{
    incomeCategory: string;
    label: string;
    range: string;
    burdened: number;
    severelyBurdened: number;
  }> | null;
}) {
  const chartData: ChartDataItem[] = data
    ? data.map(item => ({
        label: item.label,
        sublabel: item.range,
        value1: item.burdened,
        value2: item.severelyBurdened,
      }))
    : [
        { label: "Low income", sublabel: "$50,000 or less", value1: 74, value2: 44 },
        { label: "Moderate income", sublabel: "$50,000 - $74,599", value1: 40, value2: 4 },
        { label: "Median income", sublabel: "$75,000 - $99,499", value1: 10, value2: 1 },
        { label: "Upper income", sublabel: "$100,000 or more", value1: 1, value2: 0 },
      ];

  return (
    <div className="w-full">
      <CostBurdenBarChart data={chartData} height={400} />
      <div className="flex gap-6 items-center justify-center">
        <div className="flex gap-4 items-center">
          <div className="size-4.5 rounded-xs bg-cyan-400" />
          <p className="font-normal text-lg leading-7 text-black">Burdened</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="size-4.5 rounded-xs bg-cyan-200" />
          <p className="font-normal text-lg leading-7 text-black">Severely Burdened</p>
        </div>
      </div>
    </div>
  );
}
