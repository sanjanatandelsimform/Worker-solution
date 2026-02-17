import { Badge } from "@/components/base/badges/badges";
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

export default function RecommendationsPage() {
  return (
    <div className="bg-ws-gray-20 border border-ws-gray-50 rounded-xl p-6 space-y-6">
      <h2 className="text-2xl lg:text-4xl font-medium text-ws-black-60 leading-10">
        Your Company at a Glance
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        <StaticCard
          title="Total Workforce"
          titleClass="text-ws-gray-90 text-base"
          count="100-500"
          countClass="text-ws-black-30 text-3xl xl:text-4xl font-semibold mt-6"
        />
        <StaticCard
          title="Average Hourly Wage"
          titleClass="text-ws-gray-90 text-base"
          count="> $26"
          countClass="text-ws-black-30 text-3xl xl:text-4xl font-semibold mt-6"
        />
        <StaticCard
          title="Average Salary"
          titleClass="text-ws-gray-90 text-base"
          count="$30,000 - $50,000K"
          countClass="text-ws-black-30 text-3xl xl:text-4xl font-semibold mt-6"
        />
        <StaticCard
          title="Working Class Population"
          titleClass="text-ws-gray-90 text-base"
          count="89 (38%)"
          infoIcon={true}
          infoCircleClass="text-ws-black-200"
          tooltipText="How is this calculated"
          descriptionText="This is calculated based on LMI. Low-to-Moderate Income (LMI) consists of income less than 80% of the broader area's median income. "
          placements="top"
          countClass="text-ws-black-30 text-3xl xl:text-4xl font-semibold mt-6"
        />
      </div>
      <CarouselSection />
      <div className="bg-ws-white py-8 px-6 border border-ws-gray-50 rounded-2xl">
        <Badge
          type="pill-color"
          size="lg"
          className="py-3 px-4 text-xl font-semibold bg-ws-gray-30 text-ws-black-80"
        >
          Recommendation
        </Badge>
        <h2 className="mt-6 text-2xl lg:text-4xl font-medium text-ws-black-70">
          Core Benefits Enhancement
        </h2>
        <div className="flex mt-2 gap-6 flex-col xl:flex-row">
          <div className="prose w-full xl:w-1/2">
            <p className="text-ws-black-70">
              Your comprehensive plan to enhance worker financial health and retirement.
            </p>
            <p className="text-ws-black-70">
              Here are some impactful ways to start uplifting your workforce with proven strategies,
              consider strengthening core benefits by implementing new policies that increase access
              and participation.
            </p>
            <img src={workforceImg} alt="Workforce hero" />
          </div>
          <div className="w-full xl:w-1/2">
            <h3 className="text-2xl text-ws-black-70 font-medium mb-5">Proven strategies</h3>
            <div className="mt-4 space-y-4">
              <StrategiesCard
                title="1. Auto enrollment"
                titleIcon={<RefreshIcon />}
                descriptionText="Retirement benefits for new hires, with employee contributions at a rate of at least 3%"
              />
              <StrategiesCard
                title="Up to 3% match"
                titleIcon={<RefreshIcon />}
                descriptionText="For all retirement plan participants, with a minimum employer match of 1.5%"
              />
              <StrategiesCard
                title="Healthcare choice plans (FPO)"
                titleIcon={<CheckIcon />}
                descriptionText="Here a 3 medical plans with affordability"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-ws-white py-8 px-6 border border-ws-gray-50 rounded-2xl">
        <Badge
          type="pill-color"
          color="brand"
          size="lg"
          className="mb-6 py-3 px-4 text-xl font-semibold text-ws-black-80"
        >
          Strategic Recommendations
        </Badge>
        <div className="flex mt-2 gap-6 flex-col xl:flex-row">
          <div className="w-full xl:w-1/2">
            <h1 className="text-2xl lg:text-5xl text-ws-black-70 font-normal">Benefit Solutions</h1>
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
          <h3 className="text-2xl font-medium text-ws-black-70">Recommended Benefit Providers</h3>
          <div className="grid xl:grid-cols-3 gap-5 w-full mt-6">
            <BenefitCard
              badgeText="Financial"
              badgeClassess="bg-ws-cyan-20 ring-0 px-4 py-1.5 text-ws-black-20"
              title="Healthcare Alternatives"
              descriptionText="Allows employees to pay for healthcare costs interest-free and over time, like a healthcare BNPL."
              listTitle="Key Benefits"
              listIcon={<CircleCheckIcon />}
              listTexts={[
                "All employees pre-approved",
                "Access to financial education and self-guided tools",
              ]}
            />
            <BenefitCard
              badgeText="Financial"
              badgeClassess="bg-ws-cyan-20 ring-0 px-4 py-1.5 text-ws-black-20"
              title="Financial Planning"
              descriptionText="Financial wellness platform offering no-cost rainy day funds and financial therapy"
              listTitle="Key Benefits"
              listIcon={<CircleCheckIcon />}
              listTexts={[
                "All employees pre-approved",
                "Access to financial education and self-guided tools",
              ]}
            />
            <BenefitCard
              badgeText="Financial"
              badgeClassess="bg-cyan-100 ring-0 px-4 py-1.5"
              title="Emergency Savings"
              descriptionText="Encourages workers to save for emergencies with employer-matched savings accounts."
              listTitle="Key Benefits"
              listIcon={<CircleCheckIcon />}
              listTexts={[
                "All employees pre-approved",
                "Access to financial education and self-guided tools",
              ]}
            />
          </div>
        </div>
      </div>

      <div className="w-full">
        <p className="text-xs color-base-black">
          This product provides informational insights and recommendations based on the data you
          share and industry benchmarks. It does not provide legal, financial, tax, or benefits
          advice, and recommendations are not guarantees of outcomes or results. Actual results may
          vary, and you are responsible for evaluating and implementing any recommendations based on
          your organization’s specific circumstances.{" "}
          <Link to="#" className="text-cyan-500 underline">
            Terms & Conditions
          </Link>
        </p>
      </div>
    </div>
  );
}
