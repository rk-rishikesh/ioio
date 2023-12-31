import { useState } from 'react';

import { IconButton } from '../../components/buttons/IconButton';
import { config } from '../../consts/config';
import XCircle from '../../images/icons/x-circle.svg';

export function TipCard() {
  const [show, setShow] = useState(config.showTipBox);
  if (!show) return null;
  return (
    <div className="relative px-3 py-3 w-100 sm:w-[31rem] bg-gray-500 shadow-lg rounded opacity-95">
      <h2 className="text-white sm:text-lg">
        Seamless payments powered by Hyperlane’s Warp Routes
      </h2>
      <div className="flex items-end justify-between">
        <p className="text-white mt-1.5 text-xs sm:text-sm max-w-[70%]">
          Pay with USDC across any blockchain.
        </p>
      </div>
      <div className="absolute right-3 top-3 invert">
        <IconButton
          imgSrc={XCircle}
          onClick={() => setShow(false)}
          title="Hide tip"
          classes="hover:rotate-90"
        />
      </div>
    </div>
  );
}
