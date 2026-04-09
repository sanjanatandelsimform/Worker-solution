import { useEffect, useRef, useState } from "react";

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

    // Calculate max value for scaling
    const maxValue = Math.max(...data.map(item => item.value1 + item.value2));
    const yScale = chartHeight / maxValue;

    // Bar configuration
    const barWidth = 70;
    const totalBarsWidth = barWidth * data.length;
    const availableSpaceForGaps = chartWidth - totalBarsWidth;
    const barSpacing = data.length > 1 ? availableSpaceForGaps / (data.length + 1) : 0;
    const barGap = 0; // Gap between stacked bars

    // Colors from Figma
    const color1 = "#006C68"; // Darker cyan
    const color2 = "#73A09B"; // Lighter cyan
    const textColor = "#000000";
    //const labelColorBottom = "#f00";
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

      // Draw grid line
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(canvasWidth - padding.right, y);
      ctx.stroke();

      // Draw Y-axis label
      ctx.fillText(`${value}%`, padding.left - 10, y);
    }

    // Draw bars and labels
    data.forEach((item, index) => {
      const x =
        data.length > 1
          ? padding.left + barSpacing + index * (barWidth + barSpacing)
          : padding.left + (chartWidth - barWidth) / 2; // Center single bar
      const baseY = padding.top + chartHeight;

      // Calculate bar heights
      const bar1Height = item.value1 * yScale;
      const bar2Height = item.value2 * yScale;

      // Draw darker cyan bar (full width, goes up to value1)
      ctx.fillStyle = color1;
      ctx.fillRect(x, baseY - bar1Height, barWidth, bar1Height);

      // Draw lighter cyan bar (narrower, ALSO starts from bottom, nested inside)
      if (item.value2 > 0) {
        ctx.fillStyle = color2;
        const bar2Width = barWidth - barGap * 2;
        ctx.fillRect(x + barGap, baseY - bar2Height, bar2Width, bar2Height);
      }

      // ── Label drawing ──
      ctx.fillStyle = textColor;
      ctx.font = "500 14px Inter, sans-serif";
      ctx.textAlign = "center";

      const minLabelSpace = 25;
      const chartTop = padding.top;

      const value1Label = `${item.value1.toFixed(2)}%`;
      const value2Label = item.value2 > 0 ? `${item.value2.toFixed(2)}%` : null;

      const value1Y = baseY - bar1Height - 8;
      const value2Y = item.value2 > 0 ? baseY - bar2Height - 8 : 0;

      // Determine if the two labels would overlap (bars are close in height)
      const heightDiff = Math.abs(bar1Height - bar2Height);
      const labelsWouldOverlap = heightDiff < 22;

      // Draw value1 label
      if (value1Y < chartTop + minLabelSpace) {
        ctx.textBaseline = "top";
        ctx.fillText(value1Label, x + barWidth / 2, baseY - bar1Height + 8);
      } else {
        ctx.textBaseline = "bottom";
        // If labels overlap, shift value1 to the right
        const offsetX = labelsWouldOverlap && value2Label ? 22 : 0;
        ctx.fillText(value1Label, x + barWidth / 2 + offsetX, value1Y);
      }

      // Draw value2 label
      if (value2Label) {
        if (value2Y < chartTop + minLabelSpace) {
          ctx.textBaseline = "top";
          ctx.fillText(value2Label, x + barWidth / 2, baseY - bar2Height + 8);
        } else {
          ctx.textBaseline = "bottom";
          // If labels overlap, shift value2 to the left
          const offsetX = labelsWouldOverlap ? -22 : 0;
          ctx.fillText(value2Label, x + barWidth / 2 + offsetX, value2Y);
        }
      }

      // Draw main label
      ctx.font = "500 14px Inter, sans-serif";
      ctx.fillStyle = textColor;
      ctx.textBaseline = "top";
      ctx.textAlign = "center";

      const labelY = baseY + 12;
      ctx.fillText(item.label, x + barWidth / 2, labelY);

      // Draw sublabel
      ctx.font = "400 14px Inter, sans-serif";
      ctx.fillStyle = textColor;

      const sublabelY = labelY + 24;
      ctx.fillText(item.sublabel, x + barWidth / 2, sublabelY);
    });
  }, [data, canvasWidth, height]);

  // Mouse move handler for tooltips
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Chart configuration (same as in useEffect)
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

    // Check each bar
    let foundTooltip: TooltipData | null = null;

    data.forEach((item, index) => {
      const x =
        data.length > 1
          ? padding.left + barSpacing + index * (barWidth + barSpacing)
          : padding.left + (chartWidth - barWidth) / 2;
      const baseY = padding.top + chartHeight;
      const bar1Height = item.value1 * yScale;
      const bar2Height = item.value2 * yScale;

      // Check if mouse is over darker bar (wider bar)
      if (
        mouseX >= x &&
        mouseX <= x + barWidth &&
        mouseY >= baseY - bar1Height &&
        mouseY <= baseY
      ) {
        // Check if mouse is specifically over lighter bar (narrower, nested)
        const isOverLighterBar =
          item.value2 > 0 &&
          mouseX >= x + barGap &&
          mouseX <= x + barWidth - barGap &&
          mouseY >= baseY - bar2Height &&
          mouseY <= baseY;

        if (isOverLighterBar) {
          foundTooltip = {
            x: mouseX,
            y: mouseY,
            label: item.sublabel,
            value: item.value2,
            color: "#006C68",
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
          className="pointer-events-none absolute rounded-lg border border-gray-200 bg-ws-base-white px-3 py-2 shadow-lg"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y - 10}px`,
            transform: "translateY(-100%)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: tooltip.color }} />
            <div className="text-sm">
              <div className="font-medium text-ws-text-primary">{tooltip.value.toFixed(2)}%</div>
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
          <div className="size-4.5 rounded-xs bg-ws-light-teal-500" />
          <p className="font-normal text-lg leading-7 text-ws-text-primary">Burdened</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="size-4.5 rounded-xs bg-ws-light-teal-900" />
          <p className="font-normal text-lg leading-7 text-ws-text-primary">Severely Burdened</p>
        </div>
      </div>
    </div>
  );
}
