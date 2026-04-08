import { Badge } from "@/components/base/badges/badges";

export interface BenefitCardProps {
  badgeText?: string;
  title: string;
  descriptionText?: string;
  listTitle?: string;
  listIcon?: React.ReactNode;
  listTexts?: string[];
  classess?: string;
  badgeClassess?: string;
}

export default function BenefitCard({
  badgeText,
  title,
  descriptionText,
  listTitle,
  listTexts,
  classess,
  badgeClassess,
}: Readonly<BenefitCardProps>) {
  return (
    <div className={`p-6 bg-ws-base-white border border-ws-border-primary rounded-xl ${classess}`}>
      <Badge type="pill-color" color="success" size="sm" className={badgeClassess}>
        {badgeText}
      </Badge>
      <div className="mt-6 w-full flex items-end">
        <h2 className="text-2xl font-medium text-ws-text-primary">{title}</h2>
      </div>
      <p className="mt-2 min-h-auto w-full xl:min-h-18 overflow-hidden text-ws-text-tertiary text-base">
        {descriptionText}
      </p>
      <div className="text-2xl font-medium mt-4 text-ws-text-primary">{listTitle}</div>
      <ul className="flex flex-col mt-4 space-y-2 text-ws-text-tertiary text-base list-disc pl-3">
        <li className="items-center">{listTexts?.[0]}</li>
        <li className="items-center">{listTexts?.[1]}</li>
      </ul>
    </div>
  );
}
