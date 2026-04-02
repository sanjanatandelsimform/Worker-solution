export interface ProvenStrategiesCardProps {
  title: string;
  descriptionText?: string;
  titleIcon?: React.ReactNode;
  className?: string;
}
export default function ProvenStrategiesCard({
  title,
  descriptionText,
  titleIcon,
  className,
}: Readonly<ProvenStrategiesCardProps>) {
  return (
    <div className={`bg-ws-green-20 ring ring-ws-gray-40 rounded-xl p-4 min-h-48 ${className}`}>
      <h2 className="flex items-center justify-between text-xl text-ws-black-20 font-bold gap-2">
        {title}
        <span>{titleIcon}</span>
      </h2>
      <p className="text-base text-ws-black-90 mt-3">{descriptionText}</p>
    </div>
  );
}
