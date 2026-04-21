import AverageCard from "./AverageCard";

export interface AverageCardData {
  title: string;
  statics: string;
  staticsPoints?: string;
  progressValue?: number | null;
  customBarColor?: string;
  staticsPointsState?: boolean; // New prop to control badge visibility
}

export interface CardSection {
  /**
   * Section title (e.g., "Industry Average", "Your Company")
   */
  sectionTitle: string;
  /**
   * Cards to display in this section
   */
  cardsData: AverageCardData[];
  /**
   * Number of columns for this section
   * @default 2
   */
  columnsCount?: 1 | 2 | 3 | 4;
}

export interface TurnoverRateCardProps {
  title: string;
  titleQatar?: string;
  /**
   * Array of sections with their own titles and cards
   */
  sections?: CardSection[];
  industryText?: string;
  industryBoldText?: string;
  sourceBoldText?: string;
  sourceText?: string;
  className?: string;
  sourceClass?: string;
}

export default function TurnoverRateCard({
  title,
  titleQatar,
  sections,
  className,
}: Readonly<TurnoverRateCardProps>) {
  // Map column count to grid class
  const gridClassMap = {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
  };

  const getGridColsClass = (columnsCount: number | undefined) => {
    return gridClassMap[columnsCount as keyof typeof gridClassMap] || "lg:grid-cols-2";
  };

  return (
    <div className={`bg-ws-base-white ring ring-ws-border-primary rounded-xl p-5 ${className}`}>
      <h2 className="flex items-center justify-between text-lg text-ws-base-black font-medium gap-2">
        {title}
        <span className="text-xs text-ws-gray-300 uppercase">{titleQatar}</span>
      </h2>

      {/* Render Multiple Sections */}
      {sections && sections.length > 0 && (
        <div className="mt-4 space-y-6">
          {sections.map((section, sectionIndex) => (
            <div key={`section-${sectionIndex}`}>
              {/* Section Title */}
              <h3 className="text-sm font-semibold text-ws-gray-300 uppercase mb-3">
                {section.sectionTitle}
              </h3>

              {/* Cards Grid */}
              {section.cardsData && section.cardsData.length > 0 && (
                <div className={`grid grid-cols-1 ${getGridColsClass(section.columnsCount)} gap-4`}>
                  {section.cardsData.map((card, cardIndex) => (
                    <AverageCard
                      key={`${section.sectionTitle}-${card.title}-${cardIndex}`}
                      title={card.title}
                      cardStatics={card.statics}
                      staticsPoints={card.staticsPoints}
                      staticsPointsState={card.staticsPointsState}
                      progressValue={card.progressValue}
                      className="bg-ws-base-white"
                      customBarColor={card.customBarColor}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer Text */}
      {/* {industryText && (
        <p className="text-xs text-ws-gray-300 mt-4">
          {industryText}
          <span className="text-xs font-medium text-ws-text-primary">{industryBoldText}</span>
        </p>
      )}
      {sourceText && (
        <p className={cx("text-xs text-ws-gray-300 mt-2", sourceClass)}>
          {sourceText}{" "}
          <span className="text-xs font-medium text-ws-text-primary">{sourceBoldText}</span>
        </p>
      )} */}
    </div>
  );
}
