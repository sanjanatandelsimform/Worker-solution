import { Card } from "@/components";

export function RecentActivity() {
  return (
    <Card className="p-6">
      <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">New user registered</p>
            <p className="text-xs text-muted-foreground">2 hours ago</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Project completed</p>
            <p className="text-xs text-muted-foreground">5 hours ago</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Payment received</p>
            <p className="text-xs text-muted-foreground">1 day ago</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default RecentActivity;
