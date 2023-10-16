function Section5() {
  return (
    <>
      <div className="p-4 sm:p-8 md:p-16 lg:p-20 xl:p-24 bg-[#E7ECEF] ">
        <div className="font-gloock text-5xl font-bold py-4 pb-8 sm:pb-16  text-[#274C77]">
          Frequently Asked Questions
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-8 relative">
          <div className="flex flex-col items-start overflow-hidden text-[#274C77]">
            <div className="font-golos text-lg font-bold">How do I pay?</div>
            <div className="font-golos">
              Select your preferred ERC20 tokens from any chain and complete the payment through our
              secure gateway.
            </div>
          </div>
          <div className="flex flex-col items-start overflow-hidden text-[#274C77]">
            <div className="font-golos text-lg font-bold">Is it safe?</div>
            <div className="font-golos">
              Absolutely! NFT Invoices use blockchain technology, ensuring a tamper-proof, secure
              invoicing experience.
            </div>
          </div>
          <div className="flex flex-col items-start overflow-hidden text-[#274C77]">
            <div className="font-golos text-lg font-bold">Any additional fees?</div>
            <div className="font-golos">
              There are minimal transaction fees associated with cross-chain transactions and NFT
              minting.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Section5;
