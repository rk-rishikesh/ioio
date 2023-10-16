import Image from 'next/image';

import img1 from '../../../public/section3-img1.jpg';
import img2 from '../../../public/section3-img2.png';

function Section3() {
  return (
    <div className="py-24 bg-black text-[#A3CEF1]">
      <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 mx-4 p-4 sm:p-0 md:p-0 lg:p-0 xl:px-32 space-y-8 relative">
        <div className="flex flex-col justify-center items-start overflow-hidden">
          <div className="font-gloock text-3xl py-5">Fast & Easy Cross-Chain Token Payments</div>
          <div className="font-golos">
            Simply pay using your preferred ERC20 tokens, no matter which chain they&apos;re from.
            We&apos;ll take care of the cross-chain transactions.
          </div>
        </div>

        <div className="flex justify-end">
          <Image
            src={img2}
            alt="Picture of the author"
            width={450}
            height={300}
            className="display-block grayscale luminosity overflow-hidden aspect-[0.98/1] rounded-2xl bg-cover bg-no-repeat bg-center"
          />
        </div>

        <div className="flex  justify-start">
          <Image
            src={img1}
            alt="Picture of the author"
            width={450}
            height={300}
            className="display-block grayscale luminosity overflow-hidden aspect-[0.98/1] rounded-2xl bg-cover bg-no-repeat bg-center"
          />
        </div>
        <div className="flex flex-col justify-center items-start overflow-hidden">
          <div className="font-gloock text-3xl py-5">NFT Invoices on the Main Chain</div>
          <div className="font-golos">
            Your NFT invoice will be generated on the Main chain for maximum security and
            authenticity. Keep track of all your payments in one place.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Section3;
