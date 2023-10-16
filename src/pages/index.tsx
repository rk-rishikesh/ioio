import type { NextPage } from 'next';

import Section1 from '../components/homepage/section1';
import Section2 from '../components/homepage/section2';
import Section3 from '../components/homepage/section3';
import Section4 from '../components/homepage/section4';
import Section5 from '../components/homepage/section5';

const Home: NextPage = () => {
  return (
    <main>
      <Section1 />
      <Section2 />
      <Section3 />
      <Section4 />
      <Section5 />
    </main>
  );
};

export default Home;
