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
  listIcon,
  listTexts,
  classess,
  badgeClassess,
}: Readonly<BenefitCardProps>) {
  return (
    <div
      className={`p-6 bg-ws-white border border-ws-gray-50 rounded-xl shadow-sm ${classess}`}
    >
      <Badge type="pill-color" color="success" size="sm" className={badgeClassess}>
        {badgeText}
      </Badge>
      <div className="mt-6 w-full flex items-end">
        <h2 className="text-2xl font-medium text-ws-black">{title}</h2>
      </div>
      <p className="mt-2 min-h-auto w-full xl:min-h-18 overflow-hidden text-ws-gray-100 text-base">
        {descriptionText}
      </p>
      <div className="text-base font-medium mt-4 text-ws-black-50">{listTitle}</div>
      <ul className="flex flex-col mt-4 space-y-2 text-ws-gray-100 text-base">
        <li className="flex items-center gap-2">
          {listIcon} {listTexts?.[0]}
        </li>
        <li className="flex items-center gap-2">
          {listIcon} {listTexts?.[1]}
        </li>
      </ul>
    </div>
  );
}
