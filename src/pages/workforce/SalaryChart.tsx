import React, { useEffect, useRef } from "react";

type ChartItem = {
  label: string;
  boxStart: number;
  boxEnd: number;
  max: number;
  min: number;
};

interface SalaryRangeChartProps {
  data: ChartItem[];
}

const SalaryRangeChart: React.FC<SalaryRangeChartProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawChart = () => {
      const containerWidth = container.clientWidth;
      const containerHeight = 450;

      // Set canvas size for high DPI displays
      const dpr = window.devicePixelRatio || 1;
      canvas.width = containerWidth * dpr;
      canvas.height = containerHeight * dpr;
      ctx.scale(dpr, dpr);

      // Style canvas for display
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${containerHeight}px`;

      // Chart dimensions - responsive
      const chartHeight = 380;
      const chartBottom = 350;
      const chartLeft = 80;
      const chartRight = containerWidth - 50;
      const chartWidth = chartRight - chartLeft;
      const columnCount = 5;
      const columnSpacing = chartWidth / (columnCount + 0.5);
      const barWidth = columnSpacing * 0.35;
      const maxValue = 500;

      const scaleY = (value: number) => chartBottom - (value / maxValue) * chartHeight;

      const drawGrid = () => {
        ctx.strokeStyle = "#E5E7EB";
        ctx.fillStyle = "#9CA3AF";
        ctx.font = "14px Inter Regular, sans-serif";

        for (let i = 0; i <= 5; i++) {
          const value = i * 100;
          const y = scaleY(value);

          ctx.beginPath();
          ctx.moveTo(chartLeft, y);
          ctx.lineTo(chartRight, y);
          ctx.stroke();

          ctx.fillText(`$${value}`, 30, y + 5);
        }
      };

      const drawBars = () => {
        data.forEach((item, index) => {
          const x = chartLeft + columnSpacing * (index + 0.75);

          const minY = scaleY(item.min);
          const boxStart = scaleY(item.boxStart);
          const boxEnd = scaleY(item.boxEnd);
          const maxY = scaleY(item.max);
          const medianY = (boxStart + boxEnd) / 2;

          const TEAL_COLOR = "#518681";

          // Whisker line (vertical)
          ctx.strokeStyle = TEAL_COLOR;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, maxY);
          ctx.lineTo(x, minY);
          ctx.stroke();

          // Top whisker cap (horizontal line at max)
          ctx.beginPath();
          // ctx.moveTo(x - capWidth / 2, maxY);
          // ctx.lineTo(x + capWidth / 2, maxY);
          ctx.stroke();

          // Bottom whisker cap (horizontal line at min)
          ctx.beginPath();
          // ctx.moveTo(x - capWidth / 2, minY);
          // ctx.lineTo(x + capWidth / 2, minY);
          ctx.stroke();

          // Box (filled rectangle)
          ctx.fillStyle = TEAL_COLOR;
          ctx.fillRect(x - barWidth / 2, boxEnd, barWidth, boxStart - boxEnd);

          // Box border
          ctx.strokeStyle = TEAL_COLOR;
          ctx.lineWidth = 2;
          ctx.strokeRect(x - barWidth / 2, boxEnd, barWidth, boxStart - boxEnd);

          // Median line (white line inside box)
          ctx.lineWidth = 2;
          ctx.strokeStyle = TEAL_COLOR;
          ctx.beginPath();
          ctx.moveTo(x - barWidth / 2, medianY);
          ctx.lineTo(x + barWidth / 2, medianY);
          ctx.stroke();

          // Labels
          ctx.fillStyle = "#111827";
          ctx.textAlign = "center";
          ctx.font = "14px Inter Regular, sans-serif";

          // top label (box end)
          ctx.fillText(`$${item.boxEnd}`, x, maxY - 8);

          // bottom label (box start)
          ctx.fillText(`$${item.boxStart}`, x, minY + 18);

          // range label
          ctx.font = "14px Inter Regular, sans-serif";
          ctx.fillText(item.label, x, 420);
        });
      };

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid();
      drawBars();
    };

    // Initial draw
    drawChart();

    // Handle window resize
    const handleResize = () => {
      drawChart();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [data]);

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="w-full"
        style={{
          height: "450px",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    </div>
  );
};

export default SalaryRangeChart;
