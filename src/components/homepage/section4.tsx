'use client';

import { useRouter } from 'next/navigation';

function Section4() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-start bg-[#E7ECEF] py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 px-4 sm:px-8 md:px-16 lg:px-32 xl:px-32 text-[#274C77]">
      <div className="font-gloock mb-8 text-3xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl text-left py-2">
        Convinced you need a taste of Invoicify&apos;s crypto magic? Take the leap and create your first
        NFT invoice now!
      </div>
      <button
        onClick={() => router.push('/invoice')}
        className="font-golos bg-black text-[#A3CEF1] py-4 px-4 sm:px-6 rounded-md hover:bg-[#070c10] transition duration-300 text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl"
      >
        Create Invoice
      </button>
    </div>
  );
}

export default Section4;
