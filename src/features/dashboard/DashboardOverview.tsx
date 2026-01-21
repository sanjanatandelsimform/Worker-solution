import { Button } from "@/components";
import StatsCard from "./StatsCard";
import RecentActivity from "./RecentActivity";

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>
        <Button>Add New</Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={"2,543"}
          delta={"+12% from last month"}
          deltaColor="green"
        />
        <StatsCard
          title="Revenue"
          value={"$45,231"}
          delta={"+8% from last month"}
          deltaColor="green"
        />
        <StatsCard title="Active Projects" value={12} smallText={"3 completed"} />
        <StatsCard title="Tasks Pending" value={24} delta={"8 overdue"} deltaColor="red" />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecentActivity />
        <RecentActivity />
      </div>
    </div>
  );
}

export default DashboardOverview;
