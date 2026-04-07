import { Avatar } from "@/components/base/avatar/avatar";
import { Button } from "@/components/base/buttons/button";

export interface DashboardCardProps {
  title: string;
  description?: React.ReactNode;
  avatarIconSrc?: string | React.ReactNode;
  buttonLabel?: string;
  buttonType?: "primary" | "secondary" | "tertiary";
  buttonIsDisabled?: boolean;
  classes?: string;
  titleClass?: string;
  descriptionClass?: string;
  toggleButton?: boolean;
  toggleAvatar?: boolean;
  onClick?: () => void;
}

export default function DashboardCard({
  title,
  description,
  avatarIconSrc,
  buttonLabel,
  buttonType = "primary",
  buttonIsDisabled = false,
  classes = "",
  titleClass = "",
  descriptionClass = "",
  toggleButton = true,
  toggleAvatar = false,
  onClick,
}: Readonly<DashboardCardProps>) {
  // Only apply default bg-ws-base-white if classes don't provide a background color
  const hasBgClass = /\bbg-/.test(classes);
  const backgroundColor = hasBgClass ? "" : "bg-ws-base-white";

  return (
    <div
      className={`mt-6 border border-ws-border-primary rounded-xl p-4 ${backgroundColor} flex gap-4 justify-between items-center flex-col lg:flex-row ${classes}`}
    >
      <div className="flex items-center gap-4 xl:flex-row">
        {toggleAvatar &&
          (typeof avatarIconSrc === "string" ? (
            <Avatar
              size="xl"
              alt="email"
              src={avatarIconSrc}
              className="w-15 h-15 bg-ws-green-30 outline-0 flex items-center justify-center"
            />
          ) : (
            <div className="w-15 h-15 bg-ws-green-30 rounded-full flex items-center justify-center">
              {avatarIconSrc}
            </div>
          ))}
        <div>
          <h2 className={`text-ws-black-30 text-xl font-medium ${titleClass}`}>{title}</h2>
          <p className={`text-ws-gray-90 text-base mt-1 ${descriptionClass}`}>{description}</p>
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
