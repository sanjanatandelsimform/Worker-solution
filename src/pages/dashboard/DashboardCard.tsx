import { Avatar } from "@/components/base/avatar/avatar";
import { Button } from "@/components/base/buttons/button";

export interface DashboardCardProps {
  title: string;
  description?: React.ReactNode;
  avatarIconSrc?: string;
  buttonLabel?: string;
  buttonType?: "primary" | "secondary" | "tertiary";
  buttonIsDisabled?: boolean;
  onClick?: () => void;
}

export default function DashboardCard({
  title,
  description,
  avatarIconSrc,
  buttonLabel,
  buttonType = "primary",
  buttonIsDisabled = false,
  onClick,
}: Readonly<DashboardCardProps>) {
  return (
    <div className="mt-6 border border-gray-300 rounded-xl p-4 bg-primary shadow-sm flex gap-4 justify-between items-center flex-col lg:flex-row">
      <div className="flex items-center gap-4">
        <Avatar
          size="xl"
          alt="email"
          src={avatarIconSrc}
          className="p-4 bg-card-avatar outline-0"
        />
        <div>
          <h2 className="text-black text-xl font-medium mb-2">{title}</h2>
          <p className="text-card-subtitle text-base">{description}</p>
        </div>
      </div>
      <Button color={buttonType} size="sm" isDisabled={buttonIsDisabled} onClick={onClick}>
        {buttonLabel}
      </Button>
    </div>
  );
}
