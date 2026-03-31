import aboutusHero from "@/assets/aboutus-hero.svg";
export default function AboutUs() {
  return (
    <div>
      <div className="bg-ws-gray-700 pt-14 pb-19">
        <div className="flex items-center">
          <div className="flex items-center flex-wrap gap-10 w-1/2">
            <img src={aboutusHero} alt="About Hero" className="block w-full max-w-4xl" />
          </div>
          <div className="w-1/2 flex items-center justify-center">
            <div className="flex flex-col max-w-md">
              <h2 className="text-4xl font-bold text-ws-white">Introducing BeneStats</h2>
              <p className="text-base text-ws-white mt-2">
                A free assessment tool that delivers tailored benefit recommendations and industry
                benchmarks based on your company's unique needs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
