export interface StrategiesCardProps {
  title: string;
  descriptionText?: string;
  titleIcon?: React.ReactNode;
  classess?: string;
}
export default function StrategiesCard({
  title,
  descriptionText,
  titleIcon,
  classess,
}: Readonly<StrategiesCardProps>) {
  return (
    <div className={`bg-gray-card ring ring-gray-300 rounded-xl p-4 min-h-38 ${classess}`}>
      <h2 className="flex items-center text-xl text-cyan-500 font-bold gap-2">
        {titleIcon} {title}
      </h2>
      <p className="text-sm color-base-black mt-3">{descriptionText}</p>
    </div>
  );
}
