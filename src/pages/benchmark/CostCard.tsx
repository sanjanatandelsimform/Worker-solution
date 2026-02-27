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
    <div
      className={`bg-ws-white p-4 border border-ws-gray-50 rounded-lg w-full space-y-4 ${classess}`}
    >
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-lg font-medium text-ws-black">{title}</h3>
      </div>
      <div>
        <p className="text-sm text-ws-black">{year}</p>
      </div>
      <div className="flex items-center bg-ws-cyan-60 px-3 py-2 text-ws-white text-base mb-0">
        {voluntaryScore}
      </div>
      <div className="bg-ws-gray-600 text-ws-black px-3 py-2 w-3/5 mb-0 text-base">
        {involuntaryScore}
      </div>
      <div className="flex items-center justify-between mt-7">
        <div className="text-sm text-ws-black">
          {industryText}
          <span className="text-ws-purple-60">{industryCostText}</span>
        </div>
        <div className="text-sm text-ws-black">{industryTradeText}</div>
      </div>
    </div>
  );
}
