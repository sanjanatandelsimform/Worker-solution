import { Button } from "@/components/base/buttons/button";

export interface DashboardCardProps {
  title: string;
  description?: React.ReactNode;
  avatarIconSrc?: string;
  buttonLabel?: string;
  buttonType?: "primary" | "secondary" | "tertiary";
  buttonIsDisabled?: boolean;
  classes?: string;
  toggleButton?: boolean;
  onClick?: () => void;
}

export default function DashboardCard({
  title,
  description,
  buttonLabel,
  buttonType = "primary",
  buttonIsDisabled = false,
  classes = "",
  toggleButton = true,
  onClick,
}: Readonly<DashboardCardProps>) {
  // Only apply default bg-ws-white if classes don't provide a background color
  const hasBgClass = /\bbg-/.test(classes);
  const backgroundColor = hasBgClass ? "" : "bg-ws-white";

  return (
    <div
      className={`mt-6 border border-ws-primary-100 rounded-xl p-4 ${backgroundColor} shadow-sm flex gap-4 justify-between items-center flex-col lg:flex-row ${classes}`}
    >
      <div className="flex items-center gap-4 xl:flex-row">
        {/* <Avatar
          size="xl"
          alt="email"
          src={avatarIconSrc}
          className="p-4 bg-ws-navy-50 outline-0"
        /> */}
        <div>
          <h2 className="text-ws-black-30 text-xl font-medium">{title}</h2>
          <p className="text-ws-gray-90 text-base mt-1">{description}</p>
        </div>
      </div>
      {toggleButton && (
        <div className="flex-col lg:flex-row justify-end items-end flex gap-3 w-full lg:w-auto">
          <Button
            color={buttonType}
            size="sm"
            isDisabled={buttonIsDisabled}
            onClick={onClick}
            className="bg-ws-primary-900 text-ws-white hover:bg-ws-primary-900-hover focus:bg-ws-primary-900-hover active:bg-ws-primary-900-hover min-w-30"
          >
            {buttonLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
