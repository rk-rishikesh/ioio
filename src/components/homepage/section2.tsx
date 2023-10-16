function Section2() {
  return (
    <div className="w-full h-full text-black px-4 sm:px-8 md:px-16 lg:px-32 xl:px-32 py-12">
      <div className="flex flex-col justify-center items-center">
        <h1 className="font-gloock text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl text-black">
          Why INVOICYFY?
        </h1>
        <p className="font-golos py-8 text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl max-w-[80%] text-center text-black">
          Invoicify’s NFT-backed invoices elevate your payment game. Effortlessly pay with ERC20
          tokens from any chain, and get your NFT invoice generated on the Main chain.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-8">
          <div className="text-center">
            <h2 className="font-gloock text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-3xl font-semibold text-black">
              500
            </h2>
            <p className="font-golos text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg text-black">
              Supported Chains
            </p>
          </div>
          <div className="text-center">
            <h2 className="font-gloock text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-3xl font-semibold text-black">
              200
            </h2>
            <p className="font-golos text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg text-black">
              Happy Clients
            </p>
          </div>
          <div className="text-center">
            <h2 className="font-gloock text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-3xl font-semibold text-black">
              10
            </h2>
            <p className="font-golos text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg text-black">
              Instant Swaps
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Section2;
