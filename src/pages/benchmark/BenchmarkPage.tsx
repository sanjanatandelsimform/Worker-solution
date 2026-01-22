import { Button } from "@/components/base/buttons/button";
import StaticCard from "../recommendations/StaticCard";
import { Link } from "react-router-dom";
import insightHero from "@/assets/insight-hero.png";

export default function BenchmarkPage() {
  return (
    <div className="bg-gray-card border border-gray-300 rounded-xl p-6 space-y-6">
      <div className="w-full flex items-center justify-between">
        <div className="prose">
          <h2>Your Company at a Glance</h2>
        </div>
        <Button color="secondary">Share feedback</Button>
      </div>
      <div className="bg-white py-8 px-6 border border-gray-300 rounded-2xl space-y-6">
        <div className="prose">
          <h3>Industry Overview</h3>
        </div>
        <div className="flex justify-between gap-10">
          <div className="w-1/4 space-y-5">
            <StaticCard
              title="Turnover Rate 2024"
              itemAlign="between"
              count="31%"
              infoIcon={true}
              tooltipText="How is this calculated"
              descriptionText="This is calculated based on LMI. Low-to-Moderate Income (LMI) consists of income less than 80% of the broader area's median income. "
              placements="top"
            />
            <StaticCard
              title="Avg Turnover since 2020"
              itemAlign="between"
              count="40%"
              infoIcon={true}
              tooltipText="How is this calculated"
              descriptionText="This is calculated based on LMI. Low-to-Moderate Income (LMI) consists of income less than 80% of the broader area's median income. "
              placements="top"
            />
            <StaticCard
              title="Avg. Cost of Turnover"
              itemAlign="between"
              count="$4,149M"
              infoIcon={true}
              tooltipText="How is this calculated"
              descriptionText="This is calculated based on LMI. Low-to-Moderate Income (LMI) consists of income less than 80% of the broader area's median income. "
              placements="top"
            />
          </div>
          <div className="w-3/4">
            <div className="w-full space-y-6">
              <p className="text-base color-text-600">
                The Wholesale Trade sector comprises establishments engaged in
                wholesaling merchandise, generally without transformation, and
                rendering services incidental to the sale of merchandise. The
                merchandise described in this sector includes the outputs of
                agriculture, mining, manufacturing, and certain information
                industries, such as publishing.
              </p>
              <p className="text-base color-text-600">
                The wholesaling process is an intermediate step in the
                distribution of merchandise. Wholesalers are organized to sell
                or arrange the purchase or sale of (a) goods for resale (i.e.,
                goods sold to other wholesalers or retailers), (b) capital or
                durable nonconsumer goods, and (c) raw and intermediate
                materials and supplies used in production. Wholesalers sell
                merchandise to other businesses and normally operate from a
                warehouse or office. These warehouses and offices are
                characterized by having little or no display of merchandise. In
                addition, neither the design nor the location of the premises is
                intended to solicit walk-in traffic. Wholesalers do not normally
                use advertising directed to the general public.{" "}
              </p>
              <Link to="" className="text-purple-700 text-base underline">
                Read more
              </Link>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 border border-gray-300 rounded-2xl space-y-6">
          <div className="flex justify-between gap-6">
            <div className="w-3/5">
              <div className="prose">
                <h4>Insight:</h4>
              </div>
              <p className="mt-4 text-base">
                Wholesale trade plays a critical middleman role in distribution,
                relying on long-term B2B relationships rather than consumer
                outreach. Its workforce is heavily concentrated in
                transportation and sales, with transportation roles growing and
                sales roles shrinking, though both continue to have large
                replacement-driven hiring needs.
              </p>
            </div>
            <div className="w-2/5">
              <img src={insightHero} alt="Insight hero" className="w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
