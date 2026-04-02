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
      "Workers in low-wage jobs report spending an average of 1.3 hours per week dealing with personal finance-related issues when they are at work, adding up to 66 hours of lost productivity each year due to financial stress.",
  },
  {
    id: 2,
    icon: <KeyIcon className="text-ws-gray-700" />,
    title: "Did you know?",
    content:
      "Emergency savings benefits are ranked as the top emerging benefit for improving employee financial health",
  },
  {
    id: 3,
    icon: <ChartIcon className="text-ws-gray-700" />,
    title: "Did you know?",
    content:
      "73% of employees agreed that a comprehensive and personalized benefits program would increase the likelihood they would stay with their  current organization.",
  },
  {
    id: 4,
    icon: <ChartIcon className="text-ws-gray-700" />,
    title: "Did you know?",
    content:
      "Workers who are offered employer matching were 21% more likely to participate in their retirement plan than those who are not offered a match.",
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
          <div className="space-y-6 bg-ws-gray-30 border border-ws-primary-100 rounded-xl p-4">
            {/* Carousel Content - Only this slides */}
            <Carousel.Content>
              {didYouKnowSlides.map(slide => (
                <Carousel.Item key={slide.id}>
                  <div className="flex flex-col gap-2">
                    {/* Header with Icon and Title */}
                    <div className="flex items-center gap-2 text-lg text-ws-gray-700 font-medium">
                      {slide.icon}
                      <h3 className="text-lg font-medium leading-7 text-ws-gray-700">
                        {slide.title}
                      </h3>
                    </div>
                    <p className="text-base font-normal text-ws-primary-900 leading-6">{slide.content}</p>
                  </div>
                </Carousel.Item>
              ))}
            </Carousel.Content>

            {/* Navigation Controls - Fixed position, doesn't slide */}
            <div className="bg-ws-gray-50 flex items-center justify-center gap-2 border border-ws-gray-40 rounded-2xl px-3 py-2 w-fit">
              {/* Previous Button */}
              <Carousel.PrevTrigger asChild>
                <Button
                  color="tertiary"
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
                          isSelected ? "bg-ws-primary-400" : "bg-ws-gray-40"
                        )}
                      />
                    )}
                  </Carousel.Indicator>
                ))}
              </Carousel.IndicatorGroup>

              {/* Next Button */}
              <Carousel.NextTrigger asChild>
                <Button
                  color="tertiary"
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
