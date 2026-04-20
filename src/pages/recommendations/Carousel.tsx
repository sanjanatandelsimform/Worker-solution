import { CarouselLeftArrow } from "@/assets/icons/CarouselLeftArrow";
import { CarouselRightArrow } from "@/assets/icons/CarouselRightArrow";
import { ChartIcon } from "@/assets/icons/ChartIcon";
import { KeyIcon } from "@/assets/icons/KeyIcon";
import { SmileFace } from "@/assets/icons/SmileFace";
import { Carousel } from "@/components/application/carousel/carousel-base";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

// Did You Know carousel data
const didYouKnowSlides = [
  {
    id: 1,
    icon: <SmileFace className="text-ws-gray-700" />,
    title: "Did you know?",
    content:
      "Lower-income earners with access to retirement benefits are 37% less likely to participate than higher-income earners. ",
    source: "U.S. Bureau of Labor Statistics",
  },
  {
    id: 2,
    icon: <KeyIcon className="text-ws-gray-700" />,
    title: "Did you know?",
    content:
      "Lower income earners with access to medical benefits are 26% less likely to participate than top earners.",
    source: "U.S. Bureau of Labor Statistics",
  },
  {
    id: 3,
    icon: <ChartIcon className="text-ws-gray-700" />,
    title: "Did you know?",
    content:
      "Enrollment in a non-high deductible health insurance plan is associated with higher financial health.",
    source: "Financial Health Network",
  },
  {
    id: 4,
    icon: <ChartIcon className="text-ws-gray-700" />,
    title: "Did you know?",
    content:
      "The cost of replacing an individual employee can range from .5x-2x the employee's annual salary.",
    source: "Gallup",
  },
  {
    id: 5,
    icon: <ChartIcon className="text-ws-gray-700" />,
    title: "Did you know?",
    content:
      "78% of employees reported they're more likely to stay with an employer because of their benefits program.",
    source:
      "2018 Willis Towers Watson Employee and Employer Experience on a Benefit Marketplace Survey",
  },
  {
    id: 6,
    icon: <ChartIcon className="text-ws-gray-700" />,
    title: "Did you know?",
    content: "1 in 3 (32%) of Americans have no emergency savings set aside.",
    source: "Empower",
  },
];

export default function CarouselSection() {
  return (
    <>
      {/* Did You Know Carousel */}
      <div className="max-full">
        <Carousel.Root
          opts={{
            loop: true,
            align: "start",
          }}
        >
          <div className="space-y-6 bg-ws-light-teal-25 border border-ws-border-primary rounded-xl p-4">
            {/* Carousel Content - Only this slides */}
            <Carousel.Content>
              {didYouKnowSlides.map(slide => (
                <Carousel.Item key={slide.id}>
                  <div className="flex flex-col gap-2">
                    {/* Header with Icon and Title */}
                    <div className="flex items-center gap-2 text-lg text-ws-navy-950 font-medium">
                      {slide.icon}
                      <h3 className="text-lg font-medium leading-7 text-ws-navy-950">
                        {slide.title}
                      </h3>
                    </div>
                    <p className="text-base font-normal text-ws-navy-900 leading-6">
                      {slide.content}
                    </p>
                    {slide.source && (
                      <p className="text-sm font-normal text-ws-gray-500 leading-5">
                        <span className="font-medium">Source:</span> {slide.source}
                      </p>
                    )}
                  </div>
                </Carousel.Item>
              ))}
            </Carousel.Content>

            {/* Navigation Controls - Fixed position, doesn't slide */}
            <div className="bg-ws-navy-25 flex items-center justify-center gap-2 border border-ws-gray-200 rounded-2xl px-3 py-2 w-fit">
              {/* Previous Button */}
              <Carousel.PrevTrigger asChild>
                <Button
                  color="link"
                  className="p-0!"
                  size="sm"
                  iconLeading={<CarouselLeftArrow aria-label="Previous slide" />}
                />
              </Carousel.PrevTrigger>

              {/* Pagination Dots */}
              <Carousel.IndicatorGroup className="flex items-center gap-2 mx-1">
                {didYouKnowSlides.map((slide, index) => (
                  <Carousel.Indicator key={slide.id} index={index}>
                    {({ isSelected }) => (
                      <div
                        className={cx(
                          "size-2 rounded transition-colors cursor-pointer",
                          isSelected ? "bg-ws-navy-700" : "bg-ws-gray-200"
                        )}
                      />
                    )}
                  </Carousel.Indicator>
                ))}
              </Carousel.IndicatorGroup>

              {/* Next Button */}
              <Carousel.NextTrigger asChild>
                <Button
                  color="link"
                  className="p-0!"
                  size="sm"
                  iconLeading={<CarouselRightArrow aria-label="Next slide" />}
                />
              </Carousel.NextTrigger>
            </div>
          </div>
        </Carousel.Root>
      </div>
    </>
  );
}
