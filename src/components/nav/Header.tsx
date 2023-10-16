import Image from 'next/image';
import Link from 'next/link';

import { WalletControlBar } from '../../features/wallet/WalletControlBar';
import Logo from '../../images/logos/app-logo.svg';

export function Header() {
  return (
    <header className="pt-3 pb-2 w-full fixed top-0 left-0 bg-white shadow-md z-10">
      <div className="px-4 flex items-start justify-between max-w-screen-xl mx-auto">
        <Link href="/" className="py-2 flex items-center">
          <Image src={Logo} width={19} alt="" />
          Payment Chowk
        </Link>
        <div className="flex flex-col items-end md:flex-row-reverse md:items-start gap-2">
          <WalletControlBar />
        </div>
      </div>
    </header>
  );
}
