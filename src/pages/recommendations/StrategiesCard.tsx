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
    <div className={`bg-ws-gray-20 ring ring-ws-gray-50 rounded-xl p-4 min-h-38 ${classess}`}>
      <h2 className="flex items-center text-xl text-ws-cyan-60 font-bold gap-2">
        {titleIcon} {title}
      </h2>
      <p className="text-sm text-ws-black mt-3">{descriptionText}</p>
    </div>
  );
}
