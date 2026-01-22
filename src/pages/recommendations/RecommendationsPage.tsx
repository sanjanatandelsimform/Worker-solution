import { Badge } from "@/components/base/badges/badges";
import CarouselSection from "./Carousel";
import StaticCard from "./StaticCard";
import workforceImg from "@/assets/workforce-hero.jpg";
import StrategiesCard from "./StrategiesCard";
import { RefreshIcon } from "@/assets/icons/RefreshIcon";
import BenefitCard from "./BenefitCard";
import { Link } from "react-router-dom";
import { CircleCheckIcon } from "@/assets/icons/CircleCheckIcon";
import { CheckIcon } from "@/assets/icons/CheckIcon";

export default function RecommendationsPage() {
  return (
    <div className="bg-gray-card border border-gray-300 rounded-xl p-6 space-y-6">
      <h2>Your Company at a Glance</h2>
      <div className="grid grid-cols-2 gap-4 w-full">
        <StaticCard title="Total Workforce" count="235" />
        <StaticCard title="Average Hourly Wage" count="$34.62" />
        <StaticCard title="Average Salary" count="$72K" />
        <StaticCard
          title="Working Class Population"
          count="89 (38%)"
          infoIcon={true}
          tooltipText="How is this calculated"
          descriptionText="This is calculated based on LMI. Low-to-Moderate Income (LMI) consists of income less than 80% of the broader area's median income. "
          placements="top"
        />
      </div>
      <CarouselSection />
      <div className="bg-white py-8 px-6 border border-gray-300 rounded-2xl">
        <Badge type="pill-color" color="gray" size="lg">
          Recommendation
        </Badge>
        <h2 className="mt-6 text-4xl text-600 font-medium">
          Core Benefits Enhancement
        </h2>
        <div className="flex mt-2 gap-6">
          <div className="prose w-1/2">
            <p>
              Your comprehensive plan to enhance worker financial health and
              retirement.
            </p>
            <p>
              Here are some impactful ways to start uplifting your workforce
              with proven strategies, consider strengthening core benefits by
              implementing new policies that increase access and participation.
            </p>
            <img src={workforceImg} alt="Workforce hero" />
          </div>
          <div className="w-1/2">
            <h3 className="text-2xl text-600 font-medium mb-5">
              Proven strategies
            </h3>
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

      <div className="bg-white py-8 px-6 border border-gray-300 rounded-2xl">
        <Badge type="pill-color" color="brand" size="lg" className="mb-6">
          Strategic Recommendations
        </Badge>
        <div className="flex mt-2 gap-6">
          <div className="prose w-1/2">
            <h1 className="text-600 font-medium">Core Benefits Enhancement</h1>
            <p>
              Here are some top benefit solutions that address your company
              goals and employee needs based on the information provided.
            </p>
          </div>
          <div className="w-1/2">
            <div className="bg-purple-100 flex gape-4 rounded-xl">
              <div className="w-1/3">
                <img
                  src={workforceImg}
                  alt="Workforce hero"
                  className="w-full rounded-tl-xl rounded-bl-xl h-full"
                />
              </div>
              <div className="w-2/3 p-4">
                <h4 className="text-base font-medium mb-2 color-text-600">
                  Did you know?
                </h4>
                <p className="text-base color-text-600">
                  The cost of replacing an individual employee can range from
                  one-half to two times the employee's annual salary.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="prose">
            <h3>Recommended Benefit Providers</h3>
          </div>
          <div className="grid grid-cols-3 gap-5 w-full mt-6">
            <BenefitCard
              badgeText="Financial"
              badgeClassess="px-3 py-1"
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
              badgeClassess="px-3 py-1"
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
              badgeClassess="px-3 py-1"
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
          This product provides informational insights and recommendations based
          on the data you share and industry benchmarks. It does not provide
          legal, financial, tax, or benefits advice, and recommendations are not
          guarantees of outcomes or results. Actual results may vary, and you
          are responsible for evaluating and implementing any recommendations
          based on your organization’s specific circumstances.{" "}
          <Link to="#" className="text-cyan-500 underline">
            Terms & Conditions
          </Link>
        </p>
      </div>
    </div>
  );
}
