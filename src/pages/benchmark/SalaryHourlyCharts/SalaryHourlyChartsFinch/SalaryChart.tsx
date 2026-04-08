import { useEffect, useRef, useState } from "react";

interface ChartData {
  industryAverage: number;
  yourCompanyAverage: number;
  nationalAverage: number;
}

interface TooltipData {
  x: number;
  y: number;
  value: number;
  color: string;
  label: string;
}

interface SalaryChartProps {
  readonly data: ChartData;
  readonly width?: number;
  readonly height?: number;
}

export default function SalaryChart({ data, width = 500, height = 350 }: SalaryChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const colors = {
    industryAverage: "#89D4CC",
    yourCompanyAverage: "#63A2BF",
    nationalAverage: "#3B8383",
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 20, right: 30, bottom: 80, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const textColor = "#626770";
    const gridColor = "#F5F5F5";
    const axisColor = "transparent";

    // Draw Y-axis labels
    ctx.fillStyle = textColor;
    ctx.font = "400 12px Inter, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    const maxValue = 80000;
    const yScale = chartHeight / maxValue;
    const yLabels = [0, 20000, 40000, 60000, 80000];
    const yBase = padding.top + chartHeight;

    yLabels.forEach(label => {
      const y = yBase - label * yScale;
      ctx.fillText(`${label / 1000}K`, padding.left - 12, y);
    });

    // Draw axis line
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, yBase);
    ctx.stroke();

    // Draw grid lines
    ctx.stroke();
    ctx.strokeStyle = gridColor;
    yLabels.forEach(label => {
      const y = yBase - label * yScale;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    });
    ctx.stroke();

    // Draw bottom axis
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, yBase);
    ctx.lineTo(width - padding.right, yBase);
    ctx.stroke();

    // Draw bars
    const barWidth = 60;
    const barGap = 12;
    const chartCenterX = padding.left + chartWidth / 2;
    const totalBarsWidth = barWidth * 3 + barGap * 2; // 60 + 12 + 60 + 12 + 60 = 204
    const startX = chartCenterX - totalBarsWidth / 2;
    const industryX = startX;
    const yourCompanyX = startX + barWidth + barGap;
    const nationalX = startX + barWidth * 2 + barGap * 2;

    // Industry average bar
    const industryHeight = data.industryAverage * yScale;
    ctx.fillStyle = colors.industryAverage;
    ctx.fillRect(industryX, yBase - industryHeight, barWidth, industryHeight);
    ctx.strokeStyle = "#F5F5F5";
    ctx.lineWidth = 1;
    ctx.strokeRect(industryX, yBase - industryHeight, barWidth, industryHeight);

    // Your company average bar
    const yourCompanyHeight = data.yourCompanyAverage * yScale;
    ctx.fillStyle = colors.yourCompanyAverage;
    ctx.fillRect(yourCompanyX, yBase - yourCompanyHeight, barWidth, yourCompanyHeight);
    ctx.strokeStyle = "#F5F5F5";
    ctx.lineWidth = 1;
    ctx.strokeRect(yourCompanyX, yBase - yourCompanyHeight, barWidth, yourCompanyHeight);

    // National average bar
    const nationalHeight = data.nationalAverage * yScale;
    ctx.fillStyle = colors.nationalAverage;
    ctx.fillRect(nationalX, yBase - nationalHeight, barWidth, nationalHeight);
    ctx.strokeStyle = "#F5F5F5";
    ctx.lineWidth = 1;
    ctx.strokeRect(nationalX, yBase - nationalHeight, barWidth, nationalHeight);

    // Store hit detection data for tooltip
    (canvas as any).hitAreas = {
      industryBar: {
        x: industryX,
        y: yBase - industryHeight,
        width: barWidth,
        height: industryHeight,
        value: data.industryAverage,
        color: colors.industryAverage,
        label: "Industry average",
      },
      yourCompanyBar: {
        x: yourCompanyX,
        y: yBase - yourCompanyHeight,
        width: barWidth,
        height: yourCompanyHeight,
        value: data.yourCompanyAverage,
        color: colors.yourCompanyAverage,
        label: "Your company average",
      },
      nationalBar: {
        x: nationalX,
        y: yBase - nationalHeight,
        width: barWidth,
        height: nationalHeight,
        value: data.nationalAverage,
        color: colors.nationalAverage,
        label: "National average",
      },
    };
  }, [data, width, height]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const hitAreas = (canvas as any).hitAreas;
    if (!hitAreas) return;

    let foundTooltip: TooltipData | null = null;

    Object.values(hitAreas).forEach((area: any) => {
      if (
        mouseX >= area.x &&
        mouseX <= area.x + area.width &&
        mouseY >= area.y &&
        mouseY <= area.y + area.height
      ) {
        foundTooltip = {
          x: mouseX,
          y: mouseY,
          value: area.value,
          color: area.color,
          label: area.label,
        };
      }
    });

    setTooltip(foundTooltip);
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        className="block w-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: "default" }}
      />
      {tooltip && (
        <div
          className="pointer-events-none absolute flex flex-col rounded-md border border-gray-300 bg-white px-3 py-2 shadow-md"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y - 60}px`,
          }}
        >
          <p className="text-xs font-medium text-gray-700">{tooltip.label}</p>
          <span className="text-sm font-semibold text-gray-900">
            ${Math.round(tooltip.value).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
