import preparingData from "@/assets/preparingData.svg";
import { PREPARING_MSG_NON_AUTOMATED } from "@/constants/preparingDashboardMessages";

export default function PreparingDashboard({
  description = PREPARING_MSG_NON_AUTOMATED,
}: {
  readonly description?: string;
}) {
  return (
    <div className="flex items-center gap-18 min-h-88 flex-col xl:flex-row justify-center border border-ws-border-primary rounded-xl p-10">
      <img src={preparingData} alt="Preparing Dashboard" className="w-24" />
      <div className="w-full xl:max-w-lg">
        <h2 className="text-3xl font-medium text-ws-text-primary mb-1">Preparing your dashboard</h2>
        <p className="text-lg/7 text-ws-text-tertiary">{description}</p>
      </div>
    </div>
  );
}
