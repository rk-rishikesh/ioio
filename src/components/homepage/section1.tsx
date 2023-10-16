'use client';

import { useRouter } from 'next/navigation';

function Section1() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 sm:px-8 md:px-16 lg:px-32 xl:px-32 bg-[#A3CEF1]">
      <div className="font-gloock text-black-700 text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-9xl">
        INVOICIFY
      </div>

      <div className="font-golos text-gray text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-3xl mt-4 md:mt-8 mb-8 text-center">
        Welcome to Invoicify, where token payments become next-gen NFT invoices! Ditch the boring
        paper trails and ride the wave of interchain transactions.
      </div>

      <div className="mt-4">
        <button
          onClick={() => router.push('/invoice')}
          className="font-golos bg-[#274C77] text-white py-2 px-4 rounded-md hover:bg-[#355f90] transition duration-300 text-sm sm:text-base"
        >
          Create Invoice
        </button>
      </div>
    </div>
  );
}

export default Section1;
