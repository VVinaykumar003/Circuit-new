export default function InfoCard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 p-10">
      
      {/* Wrapper */}
      <div className="relative w-175">

        {/* Blue Main Card */}
        <div className="bg-teal-500 rounded-[50px] py-10 pl-32 pr-10 shadow-xl">
          
          <div className="flex items-start gap-6 text-white">
            
            <h1 className="text-6xl font-bold opacity-80">01</h1>

            <div>
              <h2 className="uppercase font-semibold tracking-wider">
                Infographic
              </h2>

              <p className="text-sm mt-2 opacity-90 leading-relaxed max-w-md">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Sed diam nonummy nibh euismod tincidunt ut laoreet dolore.
              </p>
            </div>

          </div>
        </div>

        {/* White Floating Card */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-1/3 bg-white w-28 h-28 rounded-3xl shadow-2xl flex items-center justify-center">
          💡
        </div>

      </div>
    </div>
  );
}
