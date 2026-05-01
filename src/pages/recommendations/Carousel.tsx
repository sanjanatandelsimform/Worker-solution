import { CarouselLeftArrow } from "@/assets/icons/CarouselLeftArrow";
import { CarouselRightArrow } from "@/assets/icons/CarouselRightArrow";
import { Carousel } from "@/components/application/carousel/carousel-base";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";
import { didYouKnowSlides } from "@/constants/didYouKnowSlides";

export default function CarouselSection() {
  return (
    <>
      {/* Did You Know Carousel */}
      <div className="max-full">
        <Carousel.Root
          opts={{
            loop: true,
            align: "start",
            watchDrag: false,
          }}
        >
          <div className="space-y-6 bg-ws-light-teal-25 border border-ws-border-primary rounded-xl p-4">
            {/* Carousel Content - Only this slides */}
            <Carousel.Content className="touch-none">
              {didYouKnowSlides.map(slide => (
                <Carousel.Item key={slide.id}>
                  <div className="flex flex-col gap-2">
                    {/* Header with Icon and Title */}
                    <div className="flex items-center gap-2 text-lg font-medium text-ws-navy-950 ">
                      {slide.icon}
                      <h3 className="text-lg font-medium text-ws-navy-950 leading-7">
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
            <div className="bg-ws-navy-25 flex items-center justify-center gap-2 border border-ws-gray-200 rounded-2xl px-3 w-fit">
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
