import { useEffect, useRef, useState } from "react";
import { formatPercent } from "../../utils/formatters";

interface ChartDataItem {
  label: string;
  sublabel: string;
  value1: number; // Darker cyan bar
  value2: number; // Lighter cyan bar
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

export default function CostBurdenBarChart({ data, width, height = 400 }: CanvasChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(width || 800);

  // Update canvas width based on container
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

    // Set canvas resolution for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, height);

    // Chart configuration
    const padding = { top: 50, right: 30, bottom: 80, left: 60 };
    const chartWidth = canvasWidth - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Calculate max value for scaling — default to 100 when data is empty or all zeros
    const rawMax = data.length > 0 ? Math.max(...data.map(item => item.value1 + item.value2)) : 0;
    const maxValue = rawMax > 0 ? rawMax : 100;
    const yScale = chartHeight / maxValue;

    // Bar configuration
    const barWidth = 70;
    const totalBarsWidth = barWidth * data.length;
    const availableSpaceForGaps = chartWidth - totalBarsWidth;
    const barSpacing = data.length > 1 ? availableSpaceForGaps / (data.length + 1) : 0;
    const barGap = 0; // Gap between stacked bars

    // Colors from Figma
    const color1 = "#55A19E"; // Darker Teal
    const color2 = "#D2F1EF"; // Lighter Teal
    const textColor = "#000000";
    const gridLineColor = "#D5D7DA";

    // Draw horizontal grid lines and Y-axis labels
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

    // Draw bars and labels
    data.forEach((item, index) => {
      const x =
        data.length > 1
          ? padding.left + barSpacing + index * (barWidth + barSpacing)
          : padding.left + (chartWidth - barWidth) / 2;
      const baseY = padding.top + chartHeight;

      const bar1Height = item.value1 * yScale;
      const bar2Height = item.value2 * yScale;

      // Draw darker cyan bar (full width)
      ctx.fillStyle = color1;
      ctx.fillRect(x, baseY - bar1Height, barWidth, bar1Height);

      // Draw lighter cyan bar (narrower, nested inside, from bottom)
      if (item.value2 > 0) {
        ctx.fillStyle = color2;
        const bar2Width = barWidth - barGap * 2;
        ctx.fillRect(x + barGap, baseY - bar2Height, bar2Width, bar2Height);
      }

      // ── Label drawing ──
      const bar1TopY = baseY - bar1Height;
      const bar2TopY = item.value2 > 0 ? baseY - bar2Height : null;
      const centerX = x + barWidth / 2;

      const value1Label = formatPercent(item.value1);
      const value2Label = item.value2 > 0 ? formatPercent(item.value2) : null;

      // value1 → always OUTSIDE the bar, just above its top edge
      // For very small bars, ensure label stays inside chart area (above baseline)
      ctx.font = "500 14px Inter, sans-serif";
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      const minLabelY1 = baseY - 20; // Minimum position: at least 20px above baseline
      const label1Y = Math.min(bar1TopY - 8, minLabelY1);
      ctx.fillText(value1Label, centerX, label1Y);

      // value2 → inside the bar if tall enough, otherwise just above the baseline
      if (value2Label && bar2TopY !== null) {
        ctx.font = "500 14px Inter, sans-serif";
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        
        // If bar is too short (< 20px), place label above the bar top inside chart area
        if (bar2Height < 20) {
          ctx.textBaseline = "bottom";
          const minLabelY2 = baseY - 4; // At minimum, 4px above baseline
          const label2Y = Math.min(bar2TopY - 4, minLabelY2);
          ctx.fillText(value2Label, centerX, label2Y);
        } else {
          ctx.textBaseline = "top";
          ctx.fillText(value2Label, centerX, bar2TopY + 4);
        }
      }

      // Draw main label below chart
      ctx.font = "500 14px Inter, sans-serif";
      ctx.fillStyle = textColor;
      ctx.textBaseline = "top";
      ctx.textAlign = "center";
      const labelY = baseY + 12;
      ctx.fillText(item.label, centerX, labelY);

      // Draw sublabel
      ctx.font = "400 14px Inter, sans-serif";
      ctx.fillStyle = textColor;
      ctx.fillText(item.sublabel, centerX, labelY + 24);
    });
  }, [data, canvasWidth, height]);

  // Mouse move handler for tooltips
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
    const MIN_HIT_PX = 20;

    data.forEach((item, index) => {
      const x =
        data.length > 1
          ? padding.left + barSpacing + index * (barWidth + barSpacing)
          : padding.left + (chartWidth - barWidth) / 2;
      const baseY = padding.top + chartHeight;
      const bar1Height = item.value1 * yScale;
      const bar2Height = item.value2 * yScale;

      const bar1HitHeight = Math.max(bar1Height, MIN_HIT_PX);
      const bar2HitHeight = Math.max(bar2Height, MIN_HIT_PX);

      if (
        mouseX >= x &&
        mouseX <= x + barWidth &&
        mouseY >= baseY - bar1HitHeight &&
        mouseY <= baseY
      ) {
        const isOverLighterBar =
          item.value2 > 0 &&
          mouseX >= x + barGap &&
          mouseX <= x + barWidth - barGap &&
          mouseY >= baseY - bar2HitHeight &&
          mouseY <= baseY;

        if (isOverLighterBar) {
          foundTooltip = {
            x: mouseX,
            y: mouseY,
            label: item.sublabel,
            value: item.value2,
            color: "#55A19E",
          };
        } else {
          foundTooltip = {
            x: mouseX,
            y: mouseY,
            label: item.sublabel,
            value: item.value1,
            color: "#62938E",
          };
        }
      }
    });

    setTooltip(foundTooltip);
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

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
        style={{ width: `${canvasWidth}px`, height: `${height}px`, overflowX: "auto" }}
      />
      {tooltip && (
        <div
          className="pointer-events-none absolute rounded-lg border border-ws-border-primary bg-ws-base-white px-3 py-2 shadow-lg"
          style={{
            left: tooltip.x > canvasWidth * 0.65 ? `${tooltip.x - 10}px` : `${tooltip.x + 10}px`,
            top: `${tooltip.y - 10}px`,
            transform:
              tooltip.x > canvasWidth * 0.65 ? "translate(-100%, -100%)" : "translateY(-100%)",
            minWidth: "max-content",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 shrink-0 rounded" style={{ backgroundColor: tooltip.color }} />
            <div className="text-sm">
              <div className="font-medium text-ws-text-primary">{formatPercent(tooltip.value)}</div>
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
        {
          label: "Low income",
          sublabel: "$50,000 or less",
          value1: 74,
          value2: 44,
        },
        {
          label: "Moderate income",
          sublabel: "$50,000 - $74,599",
          value1: 40,
          value2: 4,
        },
        {
          label: "Median income",
          sublabel: "$75,000 - $99,499",
          value1: 10,
          value2: 1,
        },
        {
          label: "Upper income",
          sublabel: "$100,000 or more",
          value1: 1,
          value2: 0,
        },
      ];

  return (
    <div className="w-full">
      <CostBurdenBarChart data={chartData} height={400} />
      <div className="flex gap-6 items-center justify-center">
        <div className="flex gap-4 items-center">
          <div className="size-4.5 rounded-xs bg-ws-light-teal-100" />
          <p className="font-normal text-lg leading-7 text-ws-text-primary">Burdened</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="size-4.5 rounded-xs bg-ws-light-teal-700" />
          <p className="font-normal text-lg leading-7 text-ws-text-primary">Severely Burdened</p>
        </div>
      </div>
    </div>
  );
}
