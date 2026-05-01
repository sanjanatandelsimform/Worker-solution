interface DidYouKnowBannerProps {
  readonly imageSrc: string;
  readonly imageAlt: string;
  readonly stat: string;
  readonly text: string;
}

/** Reusable "Did you know?" info banner with an image on the left and content on the right. */
export default function DidYouKnowBanner({ imageSrc, imageAlt, stat, text }: DidYouKnowBannerProps) {
  return (
    <div className="w-full mt-6">
      <div className="bg-ws-light-teal-50 flex gap-4 rounded-xl xl:max-h-33 ring-1 ring-ws-border-primary">
        <div className="flex w-100 xl:w-auto">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full xl:w-42 rounded-tl-xl rounded-bl-xl h-full object-cover"
          />
        </div>
        <div className="p-4 overflow-auto">
          <h4 className="text-base font-semibold mb-2 text-ws-light-teal-950">Did you know?</h4>
          <p className="text-lg text-ws-light-teal-950">
            <span className="font-semibold">{stat}</span> {text}
          </p>
        </div>
      </div>
    </div>
  );
}
