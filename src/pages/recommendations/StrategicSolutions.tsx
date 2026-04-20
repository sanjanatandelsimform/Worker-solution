import { CircleCheckIcon } from "@/assets/icons/CircleCheckIcon";
import BenefitCard from "./BenefitCard";
import didHeroImg from "@/assets/did-hero.jpg";
import { StrategicSolutionsCardsSkeleton } from "./RecommendationsSkeletons";
import type { StrategicRecommendation } from "@/types/recommendationsTypes";

interface StrategicSolutionsProps {
  readonly isLoading: boolean;
  readonly strategicRecommendations: StrategicRecommendation[];
}

export default function StrategicSolutions({
  isLoading,
  strategicRecommendations,
}: StrategicSolutionsProps) {
  return (
    <div className="bg-ws-light-teal-25 py-8 px-6 border border-ws-border-primary rounded-2xl">
      <div className="flex mt-2 gap-6 flex-col xl:flex-row">
        <div className="w-full">
          <h1 className="text-2xl lg:text-4xl text-ws-text-primary font-medium">
            Strategic Solutions
          </h1>
          <p className="text-base mt-4 text-ws-text-primary">
            Here are some top benefit solutions that address your company goals and employee needs
            based on the information provided.
          </p>
        </div>
      </div>
      <div className="mt-6">
        {strategicRecommendations.length > 0 ? (
          <div className="grid xl:grid-cols-3 gap-5 w-full mt-6">
            {isLoading ? (
              <>
                <StrategicSolutionsCardsSkeleton />
                <StrategicSolutionsCardsSkeleton />
                <StrategicSolutionsCardsSkeleton />
              </>
            ) : (
              <>
                {strategicRecommendations.map(recommendation => (
                  <BenefitCard
                    key={recommendation.order}
                    badgeText="Recommendation"
                    badgeClassess="bg-ws-light-teal-25 text-xs font-normal ring-1 ring-ws-light-teal-800 px-4 py-1.5 text-ws-light-teal-900"
                    title={recommendation.title}
                    descriptionText={recommendation.description}
                    listTitle="Key Features"
                    listIcon={<CircleCheckIcon />}
                    listTexts={
                      Array.isArray(recommendation.keyFeatures)
                        ? recommendation.keyFeatures
                        : [recommendation.keyFeatures]
                    }
                  />
                ))}
              </>
            )}
          </div>
        ) : (
          <div className="mt-6 p-6 bg-ws-light-teal-25 rounded-lg text-center">
            <p className="text-ws-gray-300">No recommendations available at this time.</p>
          </div>
        )}
      </div>
      <div className="w-full mt-6">
        <div className="bg-ws-light-teal-50 flex gape-4 rounded-xl xl:max-h-33 ring-1 ring-ws-border-primary">
          <div className="flex w-100 xl:w-auto">
            <img
              src={didHeroImg}
              alt="Workforce hero"
              className="w-full xl:w-42 rounded-tl-xl rounded-bl-xl h-full object-cover"
            />
          </div>
          <div className="p-4 overflow-auto">
            <h4 className="text-base font-semibold mb-2 text-ws-light-teal-950">Did you know?</h4>
            <p className="text-lg text-ws-light-teal-950">
              The cost of replacing an individual employee can range from <strong>1.5-2x</strong>{" "}
              the employee's annual salary.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
