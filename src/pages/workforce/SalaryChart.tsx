import React, { useEffect, useRef } from "react";

type ChartItem = {
  label: string;
  min: number;
  boxStart: number;
  boxEnd: number;
  max: number;
};

const data: ChartItem[] = [
  { label: "30k - 50k", min: 32, boxStart: 95, boxEnd: 350, max: 420 },
  { label: "50k - 70k", min: 70, boxStart: 150, boxEnd: 370, max: 430 },
  { label: "70k - 90k", min: 82, boxStart: 125, boxEnd: 380, max: 440 },
  { label: "90k - 110k", min: 82, boxStart: 100, boxEnd: 330, max: 410 },
  { label: "90k - 110k", min: 67, boxStart: 120, boxEnd: 305, max: 360 }
];

const SalaryRangeChart: React.FC = () => {
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
      const chartHeight = 280;
      const chartBottom = 350;
      const chartLeft = 80;
      const chartRight = containerWidth - 50;
      const chartWidth = chartRight - chartLeft;
      const columnCount = 5;
      const columnSpacing = chartWidth / (columnCount + 0.5);
      const barWidth = columnSpacing * 0.35;
      const maxValue = 500;

      const scaleY = (value: number) =>
        chartBottom - (value / maxValue) * chartHeight;

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

          // top label
          ctx.fillText(`$${item.boxEnd}`, x, maxY - 15);

          // bottom label
          ctx.fillText(`$${item.min}`, x, minY + 30);

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
  }, []);

  return (
    <div ref={containerRef} className="w-full" style={{ height: "450px" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "98%", height: "100%" }} />
    </div>
  );
};

export default SalaryRangeChart;