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
    <div className="mt-6 border border-ws-gray-50 rounded-xl p-4 bg-ws-white shadow-sm flex gap-4 justify-between items-center flex-col lg:flex-row">
      <div className="flex items-center gap-4 xl:flex-row">
        <Avatar
          size="xl"
          alt="email"
          src={avatarIconSrc}
          className="p-4 bg-ws-blue-100 outline-0"
        />
        <div>
          <h2 className="text-ws-black-30 text-xl font-medium">{title}</h2>
          <p className="text-ws-gray-90 text-base mt-1">{description}</p>
        </div>
      </div>
      <div className="flex-col lg:flex-row justify-end items-end flex gap-3 w-full lg:w-auto">
        <Button color={buttonType} size="sm" isDisabled={buttonIsDisabled} onClick={onClick}>
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
