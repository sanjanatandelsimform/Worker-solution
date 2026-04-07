// import { Badge } from "@/components/base/badges/badges";
import CarouselSection from "./Carousel";
import StaticCard from "./StaticCard";
import didHeroImg from "@/assets/did-hero.jpg";
import BenefitCard from "./BenefitCard";
import { Link } from "react-router-dom";
import { CircleCheckIcon } from "@/assets/icons/CircleCheckIcon";
import { useAppSelector } from "@/store/hooks";
import {
  selectStrategicRecommendations,
} from "@/store/selectors/dashboardSelectors";
import { GlobeIcon } from "@/assets/icons/Globe";
import { ClockIcon } from "@/assets/icons/ClockIcon";
import { BriefcaseIcon } from "@/assets/icons/BriefcaseIcon";
import { DollarIcon } from "@/assets/icons/DollarIcon";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import ProvenStrategiesCard from "./ProvenStrategiesCard";
import { LikeIcon } from "@/assets/icons/likeIcon";
import { UserGroupIcon } from "@/assets/icons/UserGroupIcon";
import { UserIcon } from "@/assets/icons/UserIcon";
import { EnrolledIcon } from "@/assets/icons/EnrolledIcon";
import { SavingIcon } from "@/assets/icons/SavingIcon";
import { HeartIcon } from "@/assets/icons/HeartIcon";

export default function RecommendationsFinchPage() {
  const strategicRecommendations = useAppSelector(selectStrategicRecommendations);
  return (
    <div className="bg-ws-base-white py-10 px-6 space-y-6 shadow-xl rounded-b-xl">
      <h2 className="text-2xl lg:text-4xl font-medium text-ws-black-60 leading-10">
        Your Company at a Glance
      </h2>
      <h4 className="text-2xl font-medium text-ws-black-90">Company Overview</h4>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full">
        <StaticCard
          classess="border-ws-gray-40"
          title="Total Workforce"
          titleClass="text-ws-black-10 text-sm"
          countIcon={<GlobeIcon className="size-5 text-ws-gray-300" />}
          count="3,021"
          countClass="text-ws-primary-700 text-3xl xl:text-4xl font-medium mt-2"
        />
        <StaticCard
          classess="border-ws-gray-40"
          title="Average Hourly Wage"
          titleClass="text-ws-black-10 text-sm"
          countIcon={<ClockIcon className="size-5 text-ws-gray-300" />}
          count="$34.62"
          countClass="text-ws-primary-700 text-3xl xl:text-4xl font-medium mt-2"
        />
        <StaticCard
          classess="border-ws-gray-40"
          title="Average Salary"
          titleClass="text-ws-black-10 text-sm"
          countIcon={<BriefcaseIcon className="size-5 text-ws-gray-300" />}
          count="$72k"
          countClass="text-ws-primary-700 text-3xl xl:text-4xl font-medium mt-2"
        />
        <StaticCard
          classess="border-ws-gray-40"
          title="Nat. Industry Median Wage"
          titleClass="text-ws-black-10 text-sm flex items-center gap-1"
          count="$67k"
          infoIcon={true}
          countIcon={<DollarIcon className="text-ws-gray-300" />}
          infoCircleClass="text-ws-black-200 size-4"
          tooltipText="How is this calculated"
          descriptionText="This is calculated based on LMI."
          placements="top"
          countClass="text-ws-primary-700 text-3xl xl:text-4xl font-medium mt-2"
        />
      </div>
      <p className="text-base text-ws-black-90 inline-block">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore.{" "}
        <Link to="#" className="underline">
          Learn more about your workforce
        </Link>
      </p>

      <h4 className="text-2xl font-medium text-ws-black-90">Benefits Overview</h4>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full">
        <StaticCard
          classess="border-ws-gray-40"
          title="Eligible Employees"
          titleClass="text-ws-black-10 text-sm"
          countIcon={<UserIcon className="size-5 text-ws-gray-300" />}
          count="2,455"
          countClass="text-ws-primary-700 text-3xl xl:text-4xl font-medium mt-2"
        />
        <StaticCard
          classess="border-ws-gray-40"
          title="Enrolled Employees"
          titleClass="text-ws-black-10 text-sm"
          countIcon={<EnrolledIcon className="size-5 text-ws-gray-300" />}
          count="2,254"
          countClass="text-ws-primary-700 text-3xl xl:text-4xl font-medium mt-2"
        />
        <StaticCard
          classess="border-ws-gray-40"
          title="Enrolled in Retirement"
          titleClass="text-ws-black-10 text-sm"
          countIcon={<SavingIcon className="size-5 text-ws-gray-300" />}
          count="64%"
          countClass="text-ws-primary-700 text-3xl xl:text-4xl font-medium mt-2"
        />
        <StaticCard
          classess="border-ws-gray-40"
          title="Enrolled in Healthcare"
          titleClass="text-ws-black-10 text-sm flex items-center gap-1"
          count="92%"
          infoIcon={true}
          countIcon={<HeartIcon className="size-5 text-ws-gray-300" />}
          infoCircleClass="text-ws-black-200 size-4"
          tooltipText="How is this calculated"
          descriptionText="This is calculated based on LMI."
          placements="top"
          countClass="text-ws-primary-700 text-3xl xl:text-4xl font-medium mt-2"
        />
      </div>

      {/* Carousel Section */}
      <CarouselSection />

      <div className="bg-ws-gray-30 py-8 px-6 border border-ws-border-primary rounded-2xl">
        <div className="flex items-stretch gap-6 flex-col xl:flex-row">
          <div className="w-full flex flex-col">
            <h2 className="text-2xl lg:text-4xl font-medium text-ws-black-90 mb-3">
              Core Benefits Enhancement
            </h2>
            <p className="text-base text-ws-black-90 mb-3">
              Your comprehensive plan to enhance worker financial health and retirement.
            </p>
            <p className="text-base text-ws-black-90 mb-3">
              Here are some impactful ways to start uplifting your workforce with proven strategies.
              Consider strengthening core benefits by modifying policies to increase access and
              participation with these options:
            </p>
            <h4 className="text-2xl font-medium text-ws-black-90 my-6">Proven strategies</h4>
            <div className="bg-ws-gray-50 border border-ws-border-primary rounded-lg p-3.5">
              <h4 className="text-lg font-medium text-ws-black-90">Strategies Impemented: 2/3</h4>
              <p className="my-4 text-base text-ws-black-90">
                You have already implemented 2 of 3 proven strategies! Keep going to see lorem ipsum
                dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                labore et dolore magna aliqua.{" "}
              </p>
              <ProgressBar
                value={66}
                labelPosition="none"
                className="mt-4 h-6 rounded-none"
                progressClassName="bg-ws-primary-300 rounded-none"
              />
            </div>
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
              <ProvenStrategiesCard
                title="Non-elective match"
                titleIcon={<LikeIcon />}
                descriptionText="Employer contributions are often skewed due to high earners’s contribution capacity. Separate the employee contribution from employer contribution."
              />
              <ProvenStrategiesCard
                title="Auto enrollment"
                titleIcon={<LikeIcon />}
                descriptionText="80% of employees automatically enrolled in a 3% 401K match stay within the retirement plan."
              />
              <ProvenStrategiesCard
                title="Healthcare affordability"
                className="bg-ws-yellow-50"
                titleIcon={<UserGroupIcon />}
                descriptionText="Consider adjusting employee premiums to income level. QSERA and ICRA plans can offer more flexibility and savings for employers and employees. "
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-ws-gray-30 py-8 px-6 border border-ws-border-primary rounded-2xl">
        <div className="flex mt-2 gap-6 flex-col xl:flex-row">
          <div className="w-full">
            <h1 className="text-2xl lg:text-4xl text-ws-black-90 font-medium">
              Strategic Solutions
            </h1>
            <p className="text-base mt-4 text-ws-black-90">
              Here are some top benefit solutions that address your company goals and employee needs
              based on the information provided.
            </p>
          </div>
        </div>
        <div className="mt-6">
          {strategicRecommendations.length > 0 ? (
            <div className="grid xl:grid-cols-3 gap-5 w-full mt-6">
              {strategicRecommendations.map(recommendation => (
                <BenefitCard
                  key={recommendation.order}
                  badgeText="Recommendation"
                  badgeClassess="bg-ws-gray-30 text-xs font-normal ring-1 ring-ws-primary-700 px-4 py-1.5 text-ws-primary-700"
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
            </div>
          ) : (
            <div className="mt-6 p-6 bg-ws-gray-30 rounded-lg text-center">
              <p className="text-ws-gray-300">No recommendations available at this time.</p>
            </div>
          )}
        </div>
        <div className="w-full mt-6">
          <div className="bg-ws-primary-50 flex gape-4 rounded-xl max-h-33 ring-1 ring-ws-border-primary">
            <div className="">
              <img
                src={didHeroImg}
                alt="Workforce hero"
                className="w-38 rounded-tl-xl rounded-bl-xl h-full object-cover"
              />
            </div>
            <div className="p-4 overflow-auto">
              <h4 className="text-base font-semibold mb-2 text-ws-tab-active-text">
                Did you know?
              </h4>
              <p className="text-lg text-ws-tab-active-text ">
                The cost of replacing an individual employee can range from one-half to two times
                the employee's annual salary.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <p className="text-xs color-base-black">
          This product provides informational insights and recommendations based on the data you
          share and industry benchmarks. It does not provide legal, financial, tax, or benefits
          advice, and recommendations are not guarantees of outcomes or results. Actual results may
          vary, and you are responsible for evaluating and implementing any recommendations based on
          your organization’s specific circumstances. Read our{" "}
          <Link to="/terms-page" className="text-ws-primary-500 underline">
            Terms & Conditions{" "}
          </Link>
          and{" "}
          <Link to="/privacy-policy" className="text-ws-primary-500 underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
