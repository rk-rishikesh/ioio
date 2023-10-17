import { WarpTokenConfig } from '../features/tokens/types';

export const tokenList: WarpTokenConfig = [
  // Example collateral token for an EVM chain
  {
    type: 'collateral',
    chainId: 11155111,
    address: '0xAB6cef991EB20E2e8270923f2CFC6B872bF1B3D4',
    hypCollateralAddress: '0xF4d417722B574e6e17db2080B666916f73181e34',
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png', // See public/logos/
  },

  // // Example NFT (ERC721) token for an EVM chain
  // {
  //   chainId: 5,
  //   name: 'Test721',
  //   symbol: 'TEST721',
  //   decimals: 0,
  //   type: 'collateral',
  //   address: '0x77566D540d1E207dFf8DA205ed78750F9a1e7c55',
  //   hypCollateralAddress: '0xDcbc0faAA269Cf649AC8950838664BB7B355BD6B',
  //   isNft: true,
  // },
];
