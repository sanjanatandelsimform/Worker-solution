// import { Badge } from "@/components/base/badges/badges";
import CarouselSection from "./Carousel";
import StaticCard from "./StaticCard";
import workforceImg from "@/assets/workforce-hero.jpg";
import didHeroImg from "@/assets/did-hero.jpg";
import StrategiesCard from "./StrategiesCard";
import { RefreshIcon } from "@/assets/icons/RefreshIcon";
import BenefitCard from "./BenefitCard";
import { Link } from "react-router-dom";
import { CircleCheckIcon } from "@/assets/icons/CircleCheckIcon";
import { CheckIcon } from "@/assets/icons/CheckIcon";
import { useAppSelector } from "@/store/hooks";
import {
  selectCompanyAtGlance,
  selectStrategicRecommendations,
} from "@/store/selectors/dashboardSelectors";
import { formatNumber, formatCurrency, formatCurrencyWithCents } from "@/utils/formatters";

export default function RecommendationsPage() {
  const companyAtGlance = useAppSelector(selectCompanyAtGlance);
  const strategicRecommendations = useAppSelector(selectStrategicRecommendations);
  return (
    <div className="bg-ws-gray-20 border border-ws-primary-100 rounded-xl p-6 space-y-6">
      <h2 className="text-2xl lg:text-4xl font-medium text-ws-black-60 leading-10">
        Your Company at a Glance
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        <StaticCard
          title="Total Workforce"
          titleClass="text-ws-gray-90 text-base"
          count={
            typeof companyAtGlance?.totalWorkforce === "number"
              ? formatNumber(companyAtGlance.totalWorkforce)
              : (companyAtGlance?.totalWorkforce ?? "N/A")
          }
          countClass="text-ws-black-30 text-3xl xl:text-4xl font-semibold mt-6"
        />
        <StaticCard
          title="Average Hourly Wage"
          titleClass="text-ws-gray-90 text-base"
          count={
            typeof companyAtGlance?.averageHourlyWage === "number"
              ? formatCurrencyWithCents(companyAtGlance.averageHourlyWage)
              : (companyAtGlance?.averageHourlyWage ?? "N/A")
          }
          countClass="text-ws-black-30 text-3xl xl:text-4xl font-semibold mt-6"
        />
        <StaticCard
          title="Average Salary"
          titleClass="text-ws-gray-90 text-base"
          count={
            typeof companyAtGlance?.averageSalary === "number"
              ? formatCurrency(companyAtGlance.averageSalary)
              : (companyAtGlance?.averageSalary ?? "N/A")
          }
          countClass="text-ws-black-30 text-3xl xl:text-4xl font-semibold mt-6"
        />
        <StaticCard
          title="National Industry Average Wage"
          titleClass="text-ws-gray-90 text-base"
          count={
            companyAtGlance?.industryAverageWage != null
              ? formatCurrency(Number(companyAtGlance.industryAverageWage))
              : "N/A"
          }
          infoCircleClass="text-ws-black-200"
          tooltipText="How is this calculated"
          descriptionText="This is calculated based on LMI. Low-to-Moderate Income (LMI) consists of income less than 80% of the broader area's median income."
          placements="top"
          countClass="text-ws-black-30 text-3xl xl:text-4xl font-semibold mt-6"
        />
      </div>
      <CarouselSection />
      <div className="bg-ws-white py-8 px-6 border border-ws-primary-100 rounded-2xl">
        {/* <Badge
          type="pill-color"
          size="lg"
          className="py-3 px-4 text-xl font-semibold bg-ws-gray-30 text-ws-black-80"
        >
          Recommendation
        </Badge> */}

        <div className="flex items-stretch gap-6 flex-col xl:flex-row">
          <div className="w-full xl:w-1/2 flex flex-col">
            <h2 className="text-2xl lg:text-4xl font-medium text-ws-black-70 mb-3">
              Core Benefits Enhancement
            </h2>
            <p className="text-base text-ws-black-70 mb-3">
              Your comprehensive plan to enhance worker financial health and retirement.
            </p>
            <p className="text-base text-ws-black-70 mb-3">
              Here are some impactful ways to start uplifting your workforce with proven strategies.
              Consider strengthening core benefits by modifying policies to increase access and
              participation with these options:
            </p>
            <div className="mt-6 flex-1 flex items-end">
              <img src={workforceImg} alt="Workforce hero" className="w-full rounded-lg" />
            </div>
          </div>
          {/* <div className="w-full xl:w-1/2">
            <h3 className="text-2xl text-ws-black-70 font-medium mb-5">Proven strategies</h3>
            <div className="mt-4 space-y-4">
              <StrategiesCard
                title="1. Implement a non-elective match"
                titleIcon={<RefreshIcon />}
                descriptionText="Employer contributions are often skewed due to high earners’s contribution capacity. Separate the employee contribution from employer contribution."
              />
              <StrategiesCard
                title="2. Auto enrollment"
                titleIcon={<RefreshIcon />}
                descriptionText="80% of employees automatically enrolled in a 3% 401K match stay within the retirement plan."
              />
              <StrategiesCard
                title="3. Ensure healthcare affordability"
                titleIcon={<CheckIcon />}
                descriptionText="Enrollment in a non-high deductible health insurance plan is associated with higher financial health. Consider adjusting employee premiums to income level. QSERA and ICRA plans can offer more flexibility and savings for employers and employees."
              />
            </div>
          </div> */}
          <div className="w-full xl:w-1/2 flex flex-col">
            <h3 className="text-2xl text-ws-black-70 font-medium mb-5">Proven strategies</h3>

            <div className="flex-1 flex flex-col justify-between gap-4">
              <StrategiesCard
                className="min-h-38!"
                title="1. Implement a non-elective match"
                titleIcon={<RefreshIcon />}
                descriptionText="Employer contributions are often skewed due to high earners’s contribution capacity. Separate the employee contribution from employer contribution."
              />

              <StrategiesCard
                className="min-h-38!"
                title="2. Auto enrollment"
                titleIcon={<RefreshIcon />}
                descriptionText="80% of employees automatically enrolled in a 3% 401K match stay within the retirement plan."
              />

              <StrategiesCard
                className="min-h-38!"
                title="3. Ensure healthcare affordability"
                titleIcon={<CheckIcon />}
                descriptionText="Enrollment in a non-high deductible health insurance plan is associated with higher financial health. Consider adjusting employee premiums to income level. QSERA and ICRA plans can offer more flexibility and savings for employers and employees."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-ws-white py-8 px-6 border border-ws-primary-100 rounded-2xl">
        {/* <Badge
        {/* <Badge
          type="pill-color"
          color="brand"
          size="lg"
          className="mb-6 py-3 px-4 text-xl font-semibold text-ws-black-80"
        >
          Strategic Recommendations
        </Badge> */}
        <div className="flex mt-2 gap-6 flex-col xl:flex-row">
          <div className="w-full xl:w-1/2">
            <h1 className="text-2xl lg:text-5xl text-ws-black-80 font-normal">
              Strategic Solutions
            </h1>
            <p className="text-base mt-4 text-ws-black">
              Here are some top benefit solutions that address your company goals and employee needs
              based on the information provided.
            </p>
          </div>
          <div className="w-full xl:w-1/2">
            <div className="bg-ws-purple-20 flex gape-4 rounded-xl max-h-33">
              <div className="w-1/4">
                <img
                  src={didHeroImg}
                  alt="Workforce hero"
                  className="w-38 rounded-tl-xl rounded-bl-xl h-full object-cover"
                />
              </div>
              <div className="w-3/4 p-4 overflow-auto">
                <h4 className="text-base font-medium mb-2 text-ws-black-70">Did you know?</h4>
                <p className="text-base text-ws-black-70">
                  The cost of replacing an individual employee can range from one-half to two times
                  the employee's annual salary.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-2xl font-medium text-ws-black-60">Recommended Solutions</h3>
          {strategicRecommendations.length > 0 ? (
            <div className="grid xl:grid-cols-3 gap-5 w-full mt-6">
              {strategicRecommendations.map(recommendation => (
                <BenefitCard
                  key={recommendation.order}
                  badgeText={recommendation.category}
                  badgeClassess="bg-ws-cyan-20 text-xs font-normal ring-0 px-4 py-1 text-ws-black-20"
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
      </div>

      <div className="w-full">
        <p className="text-xs color-base-black">
          This product provides informational insights and recommendations based on the data you
          share and industry benchmarks. It does not provide legal, financial, tax, or benefits
          advice, and recommendations are not guarantees of outcomes or results. Actual results may
          vary, and you are responsible for evaluating and implementing any recommendations based on
          your organization’s specific circumstances.{" "}
          <Link to="/terms-page" className="text-cyan-500 underline">
            Terms & Conditions
          </Link>
        </p>
      </div>
    </div>
  );
}
