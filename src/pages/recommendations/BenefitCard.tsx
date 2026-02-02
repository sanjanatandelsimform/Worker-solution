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
      className={`p-6 bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-2xl transition-transform duration-300 hover:scale-102 hover:cursor-pointer ${classess}`}
    >
      <Badge type="pill-color" color="success" size="sm" className={badgeClassess}>
        {badgeText}
      </Badge>
      <div className="prose mt-6 min-h-auto xl:min-h-24 w-full flex items-end">
        <h2 className="text-xl lg:text-3xl font-medium">{title}</h2>
      </div>
      <p className="mt-2 min-h-18 h-18 w-full overflow-hidden text-gray-500 text-base">
        {descriptionText}
      </p>
      <div className="text-base font-semibold mt-4">{listTitle}</div>
      <ul className="flex flex-col mt-4 space-y-2 text-gray-500 text-base">
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
