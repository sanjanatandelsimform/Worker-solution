type CostCardProps = {
  title: string;
  year?: string;
  voluntaryScore?: string;
  involuntaryScore?: string;
  industryText?: string;
  industryCostText?: string;
  industryTradeText?: string;
  classess?: string;
};

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
  const isNoData =
    !voluntaryScore ||
    !involuntaryScore ||
    voluntaryScore.startsWith("N/A") ||
    involuntaryScore.startsWith("N/A");

  return (
    <div
      className={`bg-ws-white p-5 border border-ws-gray-50 rounded-lg w-full flex flex-col ${classess}`}
    >
      {/* Title */}
      <h3 className="text-lg font-medium text-ws-black">{title}</h3>

      {/* Middle content */}
      <div className="flex flex-col flex-1 mt-4">
        {isNoData ? (
          <div className="flex items-center h-[110px] text-sm text-ws-black-10">
            No data available
          </div>
        ) : (
          <>
            {/* Year — spaced from title */}
            <p className="text-sm text-ws-black mb-4">{year}</p>

            {/* Cyan bar */}
            <div className="flex items-center bg-ws-cyan-60 px-3 py-2 text-ws-white text-base">
              {voluntaryScore}
            </div>

            {/* Gray bar — small gap below cyan */}
            <div className="bg-ws-gray-600 text-ws-black px-3 py-2 w-3/5 text-base">
              {involuntaryScore}
            </div>
          </>
        )}
      </div>

      {/* Industry text — pinned to bottom */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-ws-black">
          {industryText}
          <span className="text-ws-purple-60">{industryCostText}</span>
        </div>
        <div className="text-sm text-ws-black">{industryTradeText}</div>
      </div>
    </div>
  );
}
