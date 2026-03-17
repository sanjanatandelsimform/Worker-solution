import { useEffect, useRef, useState } from "react";

interface ChartDataItem {
  name: string;
  industryAverage: number;
  yourCompany: number;
  nationalAverage: number;
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
  barName: string;
}

// Fallback placeholder groups shown when data is empty or all zeros
const PLACEHOLDER_DATA: ChartDataItem[] = [
  { name: "Salary", industryAverage: 0, yourCompany: 0, nationalAverage: 0 },
  { name: "Hourly", industryAverage: 0, yourCompany: 0, nationalAverage: 0 },
];

export default function WageBarChart({ data, width, height = 350 }: CanvasChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(width || 700);

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

    const padding = { top: 10, right: 30, bottom: 60, left: 30 };
    const chartWidth = canvasWidth - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const hasData =
      data.length > 0 &&
      data.some(
        item => item.industryAverage > 0 || item.yourCompany > 0 || item.nationalAverage > 0
      );

    const renderData = hasData ? data : PLACEHOLDER_DATA;

    const barWidth = 58;
    const groupWidth = hasData ? barWidth * 3 : barWidth;
    const totalGroupsWidth = groupWidth * renderData.length;
    const availableSpaceForGaps = chartWidth - totalGroupsWidth;
    const groupSpacing =
      renderData.length > 1 ? availableSpaceForGaps / (renderData.length + 1) : 0;

    const colors = {
      industryAverage: "#00C4C7",
      yourCompany: "#22CCEE",
      nationalAverage: "#DBEBEB",
    };
    const textColor = "#000000";

    // Fixed 270px height matching Figma spec, capped to available chart area
    const PLACEHOLDER_HEIGHT = Math.min(270, chartHeight);

    renderData.forEach((item, index) => {
      const groupX =
        renderData.length > 1
          ? padding.left + groupSpacing + index * (groupWidth + groupSpacing)
          : padding.left + (chartWidth - groupWidth) / 2;
      const baseY = padding.top + chartHeight;

      if (!hasData) {
        // ── Figma placeholder colour: #F5F5F5 ──
        const placeholderColor = "#F5F5F5";
        const placeholderBorder = "#F5F5F5";

        ctx.fillStyle = placeholderColor;
        ctx.globalAlpha = 1;
        ctx.fillRect(groupX, baseY - PLACEHOLDER_HEIGHT, barWidth, PLACEHOLDER_HEIGHT);
        ctx.strokeStyle = placeholderBorder;
        ctx.lineWidth = 1;
        ctx.strokeRect(groupX, baseY - PLACEHOLDER_HEIGHT, barWidth, PLACEHOLDER_HEIGHT);
      } else {
        const groupMax = Math.max(item.industryAverage, item.yourCompany, item.nationalAverage);
        const yScale = chartHeight / groupMax;

        const bar1Height = item.industryAverage * yScale;
        const bar2Height = item.yourCompany * yScale;
        const bar3Height = item.nationalAverage * yScale;

        // National average bar (tallest, in back, light color with 40% opacity)
        ctx.fillStyle = colors.nationalAverage;
        ctx.globalAlpha = 0.4;
        ctx.fillRect(groupX + barWidth * 2, baseY - bar3Height, barWidth, bar3Height);
        ctx.strokeStyle = "#ADADAD";
        ctx.lineWidth = 1;
        ctx.strokeRect(groupX + barWidth * 2, baseY - bar3Height, barWidth, bar3Height);
        ctx.globalAlpha = 1;

        // Your company bar (medium, in middle, cyan with 80% opacity)
        ctx.fillStyle = colors.yourCompany;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(groupX + barWidth, baseY - bar2Height, barWidth, bar2Height);
        ctx.strokeStyle = "#D5D7DA";
        ctx.strokeRect(groupX + barWidth, baseY - bar2Height, barWidth, bar2Height);
        ctx.globalAlpha = 1;

        // Industry average bar (shortest, in front, teal with 80% opacity)
        ctx.fillStyle = colors.industryAverage;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(groupX, baseY - bar1Height, barWidth, bar1Height);
        ctx.strokeStyle = "#D5D7DA";
        ctx.strokeRect(groupX, baseY - bar1Height, barWidth, bar1Height);
        ctx.globalAlpha = 1;
      }

      // Category label below bars (always rendered)
      const labelCenterX = groupX + groupWidth / 2;
      ctx.fillStyle = textColor;
      ctx.font = "400 18px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.globalAlpha = 1;
      ctx.fillText(item.name, labelCenterX, baseY + 13);
    });
  }, [data, canvasWidth, height]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const hasData =
      data.length > 0 &&
      data.some(
        item => item.industryAverage > 0 || item.yourCompany > 0 || item.nationalAverage > 0
      );
    if (!hasData) {
      setTooltip(null);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const padding = { top: 10, right: 30, bottom: 60, left: 30 };
    const chartWidth = canvasWidth - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const barWidth = 58;
    const groupWidth = barWidth * 3;
    const totalGroupsWidth = groupWidth * data.length;
    const availableSpaceForGaps = chartWidth - totalGroupsWidth;
    const groupSpacing = data.length > 1 ? availableSpaceForGaps / (data.length + 1) : 0;

    let foundTooltip: TooltipData | null = null;

    data.forEach((item, index) => {
      const groupMax = Math.max(item.industryAverage, item.yourCompany, item.nationalAverage);
      const yScale = chartHeight / groupMax;

      const groupX =
        data.length > 1
          ? padding.left + groupSpacing + index * (groupWidth + groupSpacing)
          : padding.left + (chartWidth - groupWidth) / 2;
      const baseY = padding.top + chartHeight;

      const bar1Height = item.industryAverage * yScale;
      const bar2Height = item.yourCompany * yScale;
      const bar3Height = item.nationalAverage * yScale;

      if (
        mouseX >= groupX &&
        mouseX <= groupX + barWidth &&
        mouseY >= baseY - bar1Height &&
        mouseY <= baseY
      ) {
        foundTooltip = {
          x: mouseX,
          y: mouseY,
          label: item.name,
          value: item.industryAverage,
          color: "#00C4C7",
          barName: "State average",
        };
      } else if (
        mouseX >= groupX + barWidth &&
        mouseX <= groupX + barWidth * 2 &&
        mouseY >= baseY - bar2Height &&
        mouseY <= baseY
      ) {
        foundTooltip = {
          x: mouseX,
          y: mouseY,
          label: item.name,
          value: item.yourCompany,
          color: "#22CCEE",
          barName: "Your company",
        };
      } else if (
        mouseX >= groupX + barWidth * 2 &&
        mouseX <= groupX + barWidth * 3 &&
        mouseY >= baseY - bar3Height &&
        mouseY <= baseY
      ) {
        foundTooltip = {
          x: mouseX,
          y: mouseY,
          label: item.name,
          value: item.nationalAverage,
          color: "#DBEBEB",
          barName: "National average",
        };
      }
    });

    setTooltip(foundTooltip);
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const hasData =
    data.length > 0 &&
    data.some(item => item.industryAverage > 0 || item.yourCompany > 0 || item.nationalAverage > 0);

  return (
    <div className="flex w-full flex-col rounded-xl border border-ws-gray-50 bg-ws-white p-6">
      <figure
        ref={containerRef}
        aria-label="Wage comparison bar chart"
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
            className="pointer-events-none absolute rounded-lg border border-ws-gray-50 bg-ws-white px-3 py-2 shadow-lg"
            style={{
              left: `${tooltip.x + 10}px`,
              top: `${tooltip.y - 10}px`,
              transform: "translateY(-100%)",
            }}
          >
            <p className="mb-1 text-sm font-medium text-ws-black-90">{tooltip.label}</p>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded" style={{ backgroundColor: tooltip.color }} />
              <span className="text-sm text-ws-black-90">
                {tooltip.barName}: ${tooltip.value.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </figure>

      {/* Legend — grey + "Industry average" when no data; full 3-item coloured legend when real data */}
      <div className="flex flex-nowrap items-center justify-center gap-5 overflow-x-auto pt-4">
        {hasData ? (
          <>
            <div className="flex items-center gap-2">
              <div className="size-4.5 rounded-xs bg-[#00C4C7]" />
              <p className="whitespace-nowrap text-lg font-normal leading-7 text-black">
                State average
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-4.5 rounded-xs bg-[#22CCEE]" />
              <p className="whitespace-nowrap text-lg font-normal leading-7 text-black">
                Your company
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-4.5 rounded-xs bg-[#DBEBEB]" />
              <p className="whitespace-nowrap text-lg font-normal leading-7 text-black">
                National average
              </p>
            </div>
          </>
        ) : (
          // No data — Figma colour #F5F5F5 swatch + "Industry average" label
          <div className="flex items-center gap-2">
            <div className="size-4.5 rounded-xs bg-[#F5F5F5] border border-[#D1D5DB]" />
            <p className="whitespace-nowrap text-lg font-normal leading-7 text-black">
              Industry average
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
