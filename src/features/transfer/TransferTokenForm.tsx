import { Database } from '@tableland/sdk';
import BigNumber from 'bignumber.js';
import { Wallet, getDefaultProvider } from 'ethers';
import { Form, Formik, useFormikContext } from 'formik';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import {
  ProtocolSmallestUnit,
  fromWei,
  fromWeiRounded,
  isValidAddress,
  toWei,
  tryParseAmount,
} from '@hyperlane-xyz/utils';
import { WideChevron } from '@hyperlane-xyz/widgets';

import { SmallSpinner } from '../../components/animation/SmallSpinner';
import { ConnectAwareSubmitButton } from '../../components/buttons/ConnectAwareSubmitButton';
import { SolidButton } from '../../components/buttons/SolidButton';
import { ChevronIcon } from '../../components/icons/Chevron';
import { TextField } from '../../components/input/TextField';
import { toastIgpDetails } from '../../components/toast/IgpDetailsToast';
import { config } from '../../consts/config';
import { Color } from '../../styles/Color';
import { logger } from '../../utils/logger';
import { getProtocolType } from '../caip/chains';
import { getTokenAddress, isNonFungibleToken, parseCaip19Id } from '../caip/tokens';
import { ChainSelectField } from '../chains/ChainSelectField';
import { getChainDisplayName } from '../chains/utils';
import { getChainMetadata } from '../multiProvider';
import { AppState, useStore } from '../store';
import { SelectOrInputTokenIds } from '../tokens/SelectOrInputTokenIds';
import { TokenSelectField } from '../tokens/TokenSelectField';
import { useIsApproveRequired } from '../tokens/approval';
import { useDestinationBalance, useOriginBalance } from '../tokens/balances';
import { getToken } from '../tokens/metadata';
import { useRouteChains } from '../tokens/routes/hooks';
import { RoutesMap } from '../tokens/routes/types';
import { getTokenRoute, isRouteFromNative } from '../tokens/routes/utils';

import { TransferFormValues } from './types';
import { useIgpQuote } from './useIgpQuote';
import { useTokenTransfer } from './useTokenTransfer';

interface TableData {
  tokenid: number;
  tokenvalue: number;
}

async function read() {
  try {
    const privateKey = '59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
    const wallet = new Wallet(privateKey);
    // To avoid connecting to the browser wallet (locally, port 8545).
    // For example: "https://polygon-mumbai.g.alchemy.com/v2/YOUR_ALCHEMY_KEY"
    const provider = getDefaultProvider(
      'https://polygon-mumbai.g.alchemy.com/v2/YLn2OY6C8bmGyCuiBSMahWkGW0T0sTf6',
    );
    const signer = wallet.connect(provider);

    const db = new Database({ signer });
    const tableName = 'tokendata_80001_8072';

    if (tableName !== undefined) {
      const { results } = await db.prepare(`SELECT * FROM ${tableName}`).all<TableData>();
      console.log(`Read data from table '${tableName}':`);
      console.log(results[1].tokenvalue);
      return results[1].tokenvalue;
    }
  } catch (err: any) {
    console.error(err.message);
  }
}

async function write() {
  const currBalance = await read();

  try {
    const privateKey = 'b08bde2f2c0b15cb34bf98487f252eec9a3c0852dcb4ae170123594372a25259';
    const wallet = new Wallet(privateKey);
    // To avoid connecting to the browser wallet (locally, port 8545).
    // For example: "https://polygon-mumbai.g.alchemy.com/v2/YOUR_ALCHEMY_KEY"
    const provider = getDefaultProvider(
      'https://polygon-mumbai.g.alchemy.com/v2/YLn2OY6C8bmGyCuiBSMahWkGW0T0sTf6',
    );
    const signer = wallet.connect(provider);

    const db = new Database({ signer });
    const tableName = 'tokendata_80001_8072';
    if (tableName !== undefined) {
      const id = 0;
      let val = 0;
      if (currBalance != undefined) {
        val = currBalance - 1;
      }

      console.log(val);
      const { meta: write } = await db
        .prepare(`UPDATE ${tableName} SET tokenValue = ${val} WHERE tokenID = ${id}`)
        .bind()
        .run();
      await write.txn?.wait();
      console.log(`Successfully wrote data to table '${tableName}'`);
    }
  } catch (err: any) {
    console.error(err.message);
  }
}

export function TransferTokenForm({
  tokenRoutes,
  invoiceDetails,
}: {
  tokenRoutes: RoutesMap;
  invoiceDetails: any;
}) {
  const chainCaip2Ids = useRouteChains(tokenRoutes);
  const initialValues = useFormInitialValues(chainCaip2Ids, tokenRoutes);

  // Flag for if form is in input vs review mode
  const [isReview, setIsReview] = useState(false);
  // Flag for check current type of token
  const [isNft, setIsNft] = useState(false);

  const [finalAmount, setFinalAmount] = useState(invoiceDetails.totalAmount);

  const { balances, igpQuote } = useStore((state) => ({
    balances: state.balances,
    igpQuote: state.igpQuote,
  }));

  const validate = (values: TransferFormValues) =>
    validateFormValues(values, tokenRoutes, balances, igpQuote, invoiceDetails);

  const onSubmitForm = (values: TransferFormValues) => {
    logger.debug('Reviewing transfer form values:', JSON.stringify(values));
    setIsReview(true);
  };

  return (
    <Formik<TransferFormValues>
      initialValues={initialValues}
      onSubmit={onSubmitForm}
      validate={validate}
      validateOnChange={false}
      validateOnBlur={false}
    >
      <Form className="flex flex-col items-stretch w-full mt-2">
        <ChainSelectSection chainCaip2Ids={chainCaip2Ids} isReview={isReview} />
        <div className="mt-3 flex justify-between space-x-4">
          <TokenSection tokenRoutes={tokenRoutes} setIsNft={setIsNft} isReview={isReview} />
          <AmountSection
            tokenRoutes={tokenRoutes}
            isNft={isNft}
            isReview={isReview}
            invoiceDetails={invoiceDetails}
          />
        </div>

        <div className="mt-1.5 px-2.5 py-2 space-y-2 rounded border border-gray-400 bg-gray-150 text-sm break-all">
          <div className="flex flex-row">
            <a
              className="pr-8"
              target="_blank"
              href="http://localhost:3000/0x26727ed4f5ba61d3772d1575bca011ae3aef5d36/1/1"
            >
              <Image
                src="https://s3.amazonaws.com/ionic-marketplace/cordova-plugin-scratch/icon.jpg"
                width={100}
                height={100}
                alt="coupon"
              />
            </a>
            <div className="pl-8 mt-1.5 ml-1.5 pl-2 border-l border-gray-300 space-y-1.5 text-xs">
              <div className={'h-full'}>
                <p className="text-center text-sm text-gray-500 mb-6">
                  Welcome Bonus : Your highway to Rewards
                </p>
                <div
                  onClick={() => write()}
                  className="border-black bg-black flex justify-center items-center gap-2 px-6 py-2 border font-montserrat text-lg leading-none rounded-full  text-white  w-full"
                >
                  <p className="text-center text-sm text-white-500">
                    Apply this coupon and save $ 1
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <RecipientSection
          tokenRoutes={tokenRoutes}
          isReview={isReview}
          invoiceDetails={invoiceDetails}
        />
        <ReviewDetails
          visible={isReview}
          tokenRoutes={tokenRoutes}
          invoiceDetails={invoiceDetails}
        />
        <ButtonSection
          tokenRoutes={tokenRoutes}
          isReview={isReview}
          setIsReview={setIsReview}
          invoiceDetails={invoiceDetails}
          finalAmount={finalAmount}
        />
      </Form>
    </Formik>
  );
}

function ChainSelectSection({
  chainCaip2Ids,
  isReview,
}: {
  chainCaip2Ids: ChainCaip2Id[];
  isReview: boolean;
}) {
  const ChevronIcon = ({ classes }: { classes?: string }) => (
    <WideChevron
      width="17"
      height="100%"
      direction="e"
      color={Color.lightGray}
      classes={classes}
      rounded={true}
    />
  );

  return (
    <div className="flex items-center justify-center space-x-7 sm:space-x-10">
      <ChainSelectField
        name="originCaip2Id"
        label="From"
        chainCaip2Ids={chainCaip2Ids}
        disabled={isReview}
      />
      <div className="mt-10 flex flex-col items-center">
        <div className="flex mb-6 sm:space-x-1.5">
          <ChevronIcon classes="hidden sm:block" />
          <ChevronIcon />
          <ChevronIcon />
        </div>
        {/* <SwapChainsButton disabled={isReview} /> */}
      </div>
      <ChainSelectField
        name="destinationCaip2Id"
        label="To"
        chainCaip2Ids={chainCaip2Ids}
        disabled={isReview}
      />
    </div>
  );
}

function TokenSection({
  tokenRoutes,
  setIsNft,
  isReview,
}: {
  tokenRoutes: RoutesMap;
  setIsNft: (b: boolean) => void;
  isReview: boolean;
}) {
  const { values } = useFormikContext<TransferFormValues>();

  return (
    <div className="flex-1">
      <label htmlFor="tokenCaip19Id" className="block uppercase text-sm text-gray-500 pl-0.5">
        Token
      </label>
      <TokenSelectField
        name="tokenCaip19Id"
        originCaip2Id={values.originCaip2Id}
        destinationCaip2Id={values.destinationCaip2Id}
        tokenRoutes={tokenRoutes}
        disabled={isReview}
        setIsNft={setIsNft}
      />
    </div>
  );
}

function AmountSection({
  tokenRoutes,
  isNft,
  isReview,
  invoiceDetails,
}: {
  tokenRoutes: RoutesMap;
  isNft: boolean;
  isReview: boolean;
  invoiceDetails: any;
}) {
  const { values } = useFormikContext<TransferFormValues>();
  const { tokenBalance, tokenDecimals } = useOriginBalance(values, tokenRoutes);

  return (
    <div className="flex-1">
      <div className="flex justify-between pr-1">
        <label htmlFor="amount" className="block uppercase text-sm text-gray-500 pl-0.5">
          Amount
        </label>
        <TokenBalance label="My balance" balance={tokenBalance} decimals={tokenDecimals} />
      </div>
      {isNft ? (
        <SelectOrInputTokenIds disabled={isReview} tokenRoutes={tokenRoutes} />
      ) : (
        <div className="relative w-full">
          <TextField
            name="amount"
            value={invoiceDetails.totalAmount}
            classes="w-full"
            type="number"
            step="any"
            disabled={isReview}
          />
          {/* <MaxButton disabled={isReview} balance={tokenBalance} decimals={tokenDecimals} /> */}
        </div>
      )}
    </div>
  );
}

function RecipientSection({
  tokenRoutes,
  isReview,
  invoiceDetails,
}: {
  tokenRoutes: RoutesMap;
  isReview: boolean;
  invoiceDetails: any;
}) {
  const { values } = useFormikContext<TransferFormValues>();
  const { balance, decimals } = useDestinationBalance(values, tokenRoutes);

  // A crude way to detect transfer completions by triggering
  // toast on recipientAddress balance increase. This is not ideal because it
  // could confuse unrelated balance changes for message delivery
  // TODO replace with a polling worker that queries the hyperlane explorer
  const recipientAddress = values.recipientAddress;
  const prevRecipientBalance = useRef<{ balance?: string; recipientAddress?: string }>({
    balance: '',
    recipientAddress: '',
  });
  useEffect(() => {
    if (
      recipientAddress &&
      balance &&
      prevRecipientBalance.current.balance &&
      prevRecipientBalance.current.recipientAddress === recipientAddress &&
      new BigNumber(balance).gt(prevRecipientBalance.current.balance)
    ) {
      toast.success('Recipient has received funds, transfer complete!');
    }
    prevRecipientBalance.current = { balance, recipientAddress };
  }, [balance, recipientAddress, prevRecipientBalance]);

  return (
    <div className="mt-4">
      <div className="flex justify-between pr-1">
        <label htmlFor="recipientAddress" className="block uppercase text-sm text-gray-500 pl-0.5">
          Recipient Address
        </label>
        <TokenBalance label="Remote balance" balance={balance} decimals={decimals} />
      </div>
      <div className="relative w-full">
        <TextField
          name="recipientAddress"
          value={invoiceDetails.billerAddress}
          classes="w-full"
          disabled={isReview}
        />
        {/* <SelfButton disabled={isReview} /> */}
      </div>
    </div>
  );
}

function TokenBalance({
  label,
  balance,
  decimals,
}: {
  label: string;
  balance?: string | null;
  decimals?: number;
}) {
  const value = !decimals ? fromWei(balance, decimals) : fromWeiRounded(balance, decimals, false);
  return <div className="text-xs text-gray-500 text-right">{`${label}: ${value}`}</div>;
}

function ButtonSection({
  tokenRoutes,
  isReview,
  setIsReview,
  invoiceDetails,
  finalAmount,
}: {
  tokenRoutes: RoutesMap;
  isReview: boolean;
  setIsReview: (b: boolean) => void;
  invoiceDetails: any;
  finalAmount: any;
}) {
  const { values } = useFormikContext<TransferFormValues>();

  const onDoneTransactions = () => {
    setIsReview(false);
    setTransferLoading(false);
    // resetForm();
  };
  const { triggerTransactions } = useTokenTransfer(onDoneTransactions);

  const { setTransferLoading } = useStore((s) => ({
    setTransferLoading: s.setTransferLoading,
  }));

  const triggerTransactionsHandler = async () => {
    setTransferLoading(true);
    const finalValues = {
      originCaip2Id: values.originCaip2Id,
      destinationCaip2Id: values.destinationCaip2Id,
      tokenCaip19Id: values.tokenCaip19Id,
      amount: finalAmount,
      recipientAddress: invoiceDetails.billerAddress,
    };

    await triggerTransactions(finalValues, tokenRoutes);
  };

  if (!isReview) {
    return (
      <ConnectAwareSubmitButton
        chainCaip2Id={values.originCaip2Id}
        text="Continue"
        classes="mt-4 px-3 py-1.5"
      />
    );
  }

  return (
    <div className="mt-4 flex items-center justify-between space-x-4">
      <SolidButton
        type="button"
        color="gray"
        onClick={() => setIsReview(false)}
        classes="px-6 py-1.5"
        icon={<ChevronIcon direction="w" width={13} color={Color.primaryBlue} />}
      >
        <span>Edit</span>
      </SolidButton>
      <SolidButton
        type="button"
        color="blue"
        onClick={triggerTransactionsHandler}
        classes="flex-1 px-3 py-1.5"
      >
        {`Send to ${getChainDisplayName(values.destinationCaip2Id)}`}
      </SolidButton>
    </div>
  );
}

// function MaxButton({
//   balance,
//   decimals,
//   disabled,
// }: {
//   balance?: string | null;
//   decimals?: number;
//   disabled?: boolean;
// }) {
//   const { setFieldValue } = useFormikContext<TransferFormValues>();
//   const onClick = () => {
//     if (balance && !disabled) setFieldValue('amount', fromWeiRounded(balance, decimals));
//   };
//   return (
//     <SolidButton
//       type="button"
//       onClick={onClick}
//       color="gray"
//       disabled={disabled}
//       classes="text-xs rounded-sm absolute right-0.5 top-2 bottom-0.5 px-2"
//     >
//       MAX
//     </SolidButton>
//   );
// }

// function SelfButton({ disabled }: { disabled?: boolean }) {
//   const { values, setFieldValue } = useFormikContext<TransferFormValues>();
//   const address = useAccountForChain(values.destinationCaip2Id)?.address;
//   const onClick = () => {
//     if (disabled) return;
//     if (address) setFieldValue('recipientAddress', address);
//     else
//       toast.warn(`No wallet connected for chain ${getChainDisplayName(values.destinationCaip2Id)}`);
//   };
//   return (
//     <SolidButton
//       type="button"
//       onClick={onClick}
//       color="gray"
//       disabled={disabled}
//       classes="text-xs rounded-sm absolute right-0.5 top-2 bottom-0.5 px-1.5"
//     >
//       SELF
//     </SolidButton>
//   );
// }

function ReviewDetails({
  visible,
  tokenRoutes,
  invoiceDetails,
}: {
  visible: boolean;
  tokenRoutes: RoutesMap;
  invoiceDetails: any;
}) {
  const {
    values: { originCaip2Id, destinationCaip2Id, tokenCaip19Id },
  } = useFormikContext<TransferFormValues>();

  const amount = invoiceDetails.totalAmount;

  const route = getTokenRoute(originCaip2Id, destinationCaip2Id, tokenCaip19Id, tokenRoutes);
  const isNft = tokenCaip19Id && isNonFungibleToken(tokenCaip19Id);
  const sendValue = isNft ? amount.toString() : toWei(amount, route?.originDecimals).toFixed(0);
  const originUnitName = ProtocolSmallestUnit[getProtocolType(originCaip2Id)];
  const originTokenSymbol = getToken(tokenCaip19Id)?.symbol || '';
  const originNativeTokenSymbol = getChainMetadata(originCaip2Id)?.nativeToken?.symbol || '';

  const { isLoading: isApproveLoading, isApproveRequired } = useIsApproveRequired(
    tokenCaip19Id,
    sendValue,
    route,
    visible,
  );
  const { isLoading: isQuoteLoading, igpQuote } = useIgpQuote(route);

  const isLoading = isApproveLoading || isQuoteLoading;

  return (
    <div
      className={`${
        visible ? 'max-h-screen duration-1000 ease-in' : 'max-h-0 duration-500'
      } overflow-hidden transition-all`}
    >
      <label className="mt-4 block uppercase text-sm text-gray-500 pl-0.5">Transactions</label>
      {isLoading ? (
        <div className="py-6 flex items-center justify-center">
          <SmallSpinner />
        </div>
      ) : (
        <div className="mt-1.5 px-2.5 py-2 space-y-2 rounded border border-gray-400 bg-gray-150 text-sm break-all">
          {isApproveRequired && (
            <div>
              <h4>Transaction 1: Approve Transfer</h4>
              <div className="mt-1.5 ml-1.5 pl-2 border-l border-gray-300 space-y-1.5 text-xs">
                <p>{`Token Address: ${getTokenAddress(tokenCaip19Id)}`}</p>
                <p>{`Collateral Address: ${route?.baseRouterAddress}`}</p>
              </div>
            </div>
          )}
          <div>
            <h4>{`Transaction${isApproveRequired ? ' 2' : ''}: Transfer Remote`}</h4>
            <div className="mt-1.5 ml-1.5 pl-2 border-l border-gray-300 space-y-1.5 text-xs">
              <p className="flex">
                <span className="min-w-[7rem]">Remote Token</span>
                <span>{route?.destRouterAddress}</span>
              </p>
              {isNft ? (
                <p className="flex">
                  <span className="min-w-[7rem]">Token ID</span>
                  <span>{sendValue}</span>
                </p>
              ) : (
                <>
                  <p className="flex">
                    <span className="min-w-[7rem]">{`Amount (${originUnitName})`}</span>
                    <span>{`${sendValue} ${originTokenSymbol}`}</span>
                  </p>
                  <p className="flex">
                    <span className="min-w-[7rem]">{`Interchain Gas (${originUnitName})`}</span>
                    <span>{`${igpQuote?.weiAmount || '0'} ${originNativeTokenSymbol}`}</span>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function validateFormValues(
  values: TransferFormValues,
  tokenRoutes: RoutesMap,
  balances: AppState['balances'],
  igpQuote: AppState['igpQuote'],
  invoiceDetails: any,
) {
  const { originCaip2Id, destinationCaip2Id, tokenCaip19Id } = values;
  const recipientAddress = invoiceDetails.billerAddress;
  const amount = invoiceDetails.totalAmount;
  const route = getTokenRoute(originCaip2Id, destinationCaip2Id, tokenCaip19Id, tokenRoutes);
  if (!route) return { destinationCaip2Id: 'No route found for chains/token' };

  if (!originCaip2Id) return { originCaip2Id: 'Invalid origin chain' };
  if (!destinationCaip2Id) return { destinationCaip2Id: 'Invalid destination chain' };

  if (!tokenCaip19Id) return { tokenCaip19Id: 'Token required' };
  const { address: tokenAddress } = parseCaip19Id(tokenCaip19Id);
  if (!isValidAddress(tokenAddress)) return { tokenCaip19Id: 'Invalid token' };

  const destProtocol = getProtocolType(destinationCaip2Id);
  if (!isValidAddress(recipientAddress, destProtocol))
    return { recipientAddress: 'Invalid recipient' };

  const isNft = isNonFungibleToken(tokenCaip19Id);
  const parsedAmount = tryParseAmount(amount);
  if (!parsedAmount || parsedAmount.lte(0))
    return { amount: isNft ? 'Invalid Token Id' : 'Invalid amount' };
  const sendValue = isNft ? parsedAmount : toWei(parsedAmount, route?.originDecimals);

  if (!isNft) {
    // Validate balances for ERC20-like tokens
    if (sendValue.gt(balances.senderTokenBalance)) return { amount: 'Insufficient balance' };
    // Ensure balances can cover IGP fees
    const igpWeiAmount = new BigNumber(igpQuote?.weiAmount || 0);
    const requiredNativeBalance = isRouteFromNative(route)
      ? sendValue.plus(igpWeiAmount)
      : igpWeiAmount;
    if (requiredNativeBalance.gt(balances.senderNativeBalance)) {
      toastIgpDetails();
      return { amount: 'Insufficient native token for gas' };
    }
  } else {
    // Validate balances for ERC721-like tokens
    const { isSenderNftOwner, senderNftIds } = balances;
    const nftId = sendValue.toString();
    if (isSenderNftOwner === false || (senderNftIds && !senderNftIds.includes(nftId))) {
      return { amount: 'Token ID not owned' };
    }
  }

  if (
    config.withdrawalWhitelist &&
    !config.withdrawalWhitelist.split(',').includes(destinationCaip2Id)
  ) {
    return { destinationCaip2Id: 'Bridge is in deposit-only mode' };
  }

  if (
    config.transferBlacklist &&
    config.transferBlacklist.split(',').includes(`${originCaip2Id}-${destinationCaip2Id}`)
  ) {
    return { destinationCaip2Id: 'Route is not currently allowed' };
  }

  return {};
}

function useFormInitialValues(
  chainCaip2Ids: ChainCaip2Id[],
  tokenRoutes: RoutesMap,
): TransferFormValues {
  return useMemo(() => {
    const firstRoute = Object.values(tokenRoutes[chainCaip2Ids[0]]).filter(
      (routes) => routes.length,
    )[0][0];
    return {
      originCaip2Id: firstRoute.originCaip2Id,
      destinationCaip2Id: firstRoute.destCaip2Id,
      amount: '',
      tokenCaip19Id: '' as TokenCaip19Id,
      recipientAddress: '',
    };
  }, [chainCaip2Ids, tokenRoutes]);
}
