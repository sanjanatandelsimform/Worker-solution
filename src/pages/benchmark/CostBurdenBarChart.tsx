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
    const barWidth = 128;
    const totalBarsWidth = barWidth * data.length;
    const availableSpaceForGaps = chartWidth - totalBarsWidth;
    const barSpacing = data.length > 1 ? availableSpaceForGaps / (data.length + 1) : 0;
    const barGap = 18; // Gap between stacked bars

    // Colors from Figma
    const color1 = "#6dc5d3"; // Darker cyan
    const color2 = "#a5f0fc"; // Lighter cyan
    const textColor = "#000000";
    const gridLineColor = "#ccc";

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
      // Darker bar goes from bottom to value1 height
      // Lighter bar ALSO starts from bottom, goes to value2 height (inside darker bar)
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

      // Draw value1 label (above the darker cyan bar)
      ctx.fillStyle = textColor;
      ctx.font = "500 14px Inter, sans-serif";
      ctx.textAlign = "center";

      // Position value1 label - if bar is too small or would go outside chart, place inside
      const minLabelSpace = 25; // Minimum space needed above bar for label
      const value1Y = baseY - bar1Height - 8;
      const chartTop = padding.top;

      if (value1Y < chartTop + minLabelSpace) {
        // Place label inside the bar
        ctx.textBaseline = "top";
        ctx.fillText(`${item.value1}%`, x + barWidth / 2, baseY - bar1Height + 8);
      } else {
        // Place label above the bar
        ctx.textBaseline = "bottom";
        ctx.fillText(`${item.value1}%`, x + barWidth / 2, value1Y);
      }

      // Draw value2 label (above or inside the lighter cyan bar)
      if (item.value2 > 0) {
        const value2Y = baseY - bar2Height - 8;

        if (value2Y < chartTop + minLabelSpace) {
          // Place label inside the bar
          ctx.textBaseline = "top";
          ctx.fillText(`${item.value2}%`, x + barWidth / 2, baseY - bar2Height + 8);
        } else {
          // Place label above the bar
          ctx.textBaseline = "bottom";
          ctx.fillText(`${item.value2}%`, x + barWidth / 2, value2Y);
        }
      }

      // Draw main label
      ctx.font = "500 14px Inter, sans-serif";
      ctx.fillStyle = textColor;
      ctx.textBaseline = "top";

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
            color: "#a5f0fc",
          };
        } else {
          foundTooltip = {
            x: mouseX,
            y: mouseY,
            label: item.sublabel,
            value: item.value1,
            color: "#6dc5d3",
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

// Example usage with the Figma data
export function IncomeDistributionChart() {
  const chartData: ChartDataItem[] = [
    {
      label: "Low income",
      sublabel: "$55,250 or less",
      value1: 74,
      value2: 44,
    },
    {
      label: "Moderate income",
      sublabel: "$55,250 - $88,400",
      value1: 40,
      value2: 4,
    },
    {
      label: "Median income",
      sublabel: "$88,400 - $132,600",
      value1: 10,
      value2: 1,
    },
    {
      label: "Upper income",
      sublabel: "$132,600 or more",
      value1: 1,
      value2: 0,
    },
  ];

  return (
    <div className="w-full">
      <CostBurdenBarChart data={chartData} height={400} />
      {/* Legend */}
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
