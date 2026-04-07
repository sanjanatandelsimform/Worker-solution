import { useEffect, useRef } from 'react';

interface DonutChartProps {
  /**
   * Percentage value (0-100)
   */
  percentage: number;
  
  /**
   * Label text displayed below the percentage (e.g., "Full Time")
   */
  label: string;
  
  /**
   * Center text displayed with the percentage (optional, defaults to formatted percentage)
   */
  centerText?: string;
  
  /**
   * Color of the progress portion (e.g., "bg-ws-progress-primary" or hex color)
   */
  progressColor: string;
  
  /**
   * Color of the background portion (e.g., "bg-ws-light-teal-25" or hex color)
   */
  backgroundColor?: string;
  
  /**
   * Chart width in pixels
   * @default 200
   */
  width?: number;
  
  /**
   * Chart height in pixels
   * @default 200
   */
  height?: number;
  
  /**
   * Ring stroke width in pixels
   * @default 30
   */
  strokeWidth?: number;
  
  /**
   * Container CSS class
   */
  className?: string;
}

// Helper function to convert Tailwind color class to hex
const getColorFromClass = (colorClass: string): string => {
  const colorMap: Record<string, string> = {
    'color-ws-progress-primary': '#89D4CC',
    'bg-ws-progress-primary': '#E6EDED',
    'color-ws-progress-secondary': '#79C2E4',
    'bg-ws-progress-secondary': '#EEF7FC',
    'color-ws-progress-turnery': '#3B8383',
    'bg-ws-progress-turnery': '#E6EDED',
    // 'bg-ws-primary-100': '#A8D5E2',
    // 'bg-ws-primary-300': '#5B8FA3',
    // 'bg-ws-light-teal-25': '#E8E8E8',
    // 'bg-ws-gray-40': '#D8D8D8',
    // 'bg-ws-navy-25': '#C8C8C8',
  };
  return colorMap[colorClass] || colorClass;
};

export default function DonutChart({
  percentage,
  label,
  progressColor,
  backgroundColor = 'bg-ws-light-teal-25',
  width = 200,
  height = 200,
  strokeWidth = 30,
  className = '',
}: Readonly<DonutChartProps>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with DPR for retina displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Normalize percentage
    const normalizedPercentage = Math.min(Math.max(percentage, 0), 100);

    // Colors
    const progressCol = getColorFromClass(progressColor);
    const bgCol = getColorFromClass(backgroundColor);

    // Center and radius
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 15;
    //const innerRadius = radius - strokeWidth;

    // Draw background circle (full ring)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = bgCol;
    ctx.lineWidth = strokeWidth;
    //ctx.lineCap = 'round';
    ctx.stroke();

    // Draw progress arc
    const startAngle = -Math.PI / 2; // Start at top
    const endAngle = startAngle + (2 * Math.PI * normalizedPercentage) / 100;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = progressCol;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();

    // Draw center text
    ctx.fillStyle = '#1a1a1a'; // Dark text color
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Percentage text (larger)
    ctx.font = `28px bold Inter, sans-serif`;
    ctx.fillText(`${normalizedPercentage.toFixed(0)}%`, centerX, centerY - 10);

    // Label text (smaller)
    ctx.font = `20px normal Inter, sans-serif`;
    ctx.fillText(label, centerX, centerY + 25);
  }, [percentage, label, progressColor, backgroundColor, width, height, strokeWidth]);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <canvas ref={canvasRef} />
    </div>
  );
}
