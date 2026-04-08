import preparingData from "@/assets/preparingData.svg";
export default function PreparingDashboard() {
  return (
    <div className="flex items-center gap-18 min-h-88">
      <img src={preparingData} alt="Preparing Dashboard" className="w-24" />
      <div className="max-w-lg">
        <h2 className="text-3xl font-medium text-ws-text-primary mb-1">Preparing your dashboard</h2>
        <p className="text-lg/7 text-ws-text-tertiary">
          Finch is working hard with your payroll provider to create your custom dashboard. This may
          take 24-36 hours. We'll send an email once your setup is complete.{" "}
        </p>
      </div>
    </div>
  );
}
