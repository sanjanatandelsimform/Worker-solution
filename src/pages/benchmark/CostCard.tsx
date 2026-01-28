export interface CostCardProps {
  title: string;
  year?: string;
  voluntaryScore?: string;
  involuntaryScore?: string;
  industryText?: string;
  industryCostText?: string;
  industryTradeText?: string;
  classess?: string;
}
export default function CostCard({
  title,
  year,
  voluntaryScore,
  involuntaryScore,
  industryText,
  industryCostText,
  industryTradeText,
  classess,
}: Readonly<CostCardProps>) {
  return (
    <div className={`bg-white p-4 border border-gray-300 rounded-lg w-full space-y-4 ${classess}`}>
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-black">{year}</p>
      </div>
      <div className="flex items-center bg-cyan-500 px-3 py-2 text-white text-base mb-0">
        {voluntaryScore}
      </div>
      <div className="bg-gray-invoice text-black px-3 py-2 w-[70%] mb-0">{involuntaryScore}</div>
      <div className="flex items-center justify-between mt-7">
        <div className="text-sm text-black">
          {industryText}
          <span className="text-purple-600">{industryCostText}</span>
        </div>
        <div className="text-sm text-black">{industryTradeText}</div>
      </div>
    </div>
  );
}
