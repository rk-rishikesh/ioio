import Head from 'next/head';
import { PropsWithChildren } from 'react';

import { Footer } from '../nav/Footer';
import { Header } from '../nav/Header';

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Payment Chowk</title>
      </Head>
      <div className="px-32">
        <Header />
      </div>
      <main>{children}</main>
      <div className="px-32">
        <Footer />
      </div>
    </>
  );
}
