import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { ChainLogo } from '../../components/icons/ChainLogo';
import { Identicon } from '../../components/icons/Identicon';
import CollapseIcon from '../../images/icons/collapse-icon.svg';
import ConfirmedIcon from '../../images/icons/confirmed-icon.svg';
import DeliveredIcon from '../../images/icons/delivered-icon.svg';
import Logout from '../../images/icons/logout.svg';
import WarningIcon from '../../images/icons/transfer-warning-status.svg';
import Wallet from '../../images/icons/wallet.svg';
import { tryClipboardSet } from '../../utils/clipboard';
import { useStore } from '../store';
import { TransfersDetailsModal } from '../transfer/TransfersDetailsModal';
import { TransferContext, TransferStatus } from '../transfer/types';

import { useAccounts, useDisconnectFns } from './hooks';

const STATUSES_WITH_ICON = [
  TransferStatus.Delivered,
  TransferStatus.ConfirmedTransfer,
  TransferStatus.Failed,
];

const getIconByTransferStatus = (status: TransferStatus) => {
  switch (status) {
    case TransferStatus.Delivered:
      return DeliveredIcon;
    case TransferStatus.ConfirmedTransfer:
      return ConfirmedIcon;
    case TransferStatus.Failed:
      return WarningIcon;
    default:
      return WarningIcon;
  }
};

export function SideBarMenu({
  onConnectWallet,
  isOpen,
  onClose,
  notifications,
}: {
  onConnectWallet: () => void;
  isOpen: boolean;
  onClose: () => void;
  notifications: any;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferContext | null>(null);
  // const [signer, setSigner] = useState(null);

  const disconnects = useDisconnectFns();
  const { readyAccounts } = useAccounts();
  const didMountRef = useRef(false);

  const { transfers, resetTransfers, transferLoading } = useStore((s) => ({
    transfers: s.transfers,
    resetTransfers: s.resetTransfers,
    transferLoading: s.transferLoading,
  }));

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
    } else if (transferLoading) {
      setSelectedTransfer(transfers[transfers.length - 1]);
      setIsModalOpen(true);
    }
  }, [transfers, transferLoading]);

  useEffect(() => {
    setIsMenuOpen(isOpen);
  }, [isOpen]);

  const onClickCopy = (value?: string) => async () => {
    if (!value) return;
    await tryClipboardSet(value);
    toast.success('Address copied to clipboard', { autoClose: 2000 });
  };

  const onClickDisconnect = async () => {
    for (const disconnectFn of Object.values(disconnects)) {
      await disconnectFn();
    }
  };

  const sortedTransfers = useMemo(
    () => [...transfers].sort((a, b) => b.timestamp - a.timestamp) || [],
    [transfers],
  );

  return (
    <>
      <div
        className={`fixed right-0 top-0 h-full w-88 bg-white bg-opacity-95 shadow-lg transform ease-in duration-100 transition-transform ${
          isMenuOpen ? 'translate-x-0 z-30' : 'translate-x-full z-0'
        }`}
      >
        {isMenuOpen && (
          <button
            className="absolute flex items-center justify-center w-9 h-full -translate-x-full left-0 top-0 bg-white bg-opacity-60 hover:bg-opacity-80 rounded-l-md transition-all"
            onClick={() => onClose()}
          >
            <Image src={CollapseIcon} width={15} height={24} alt="" />
          </button>
        )}
        <div className="w-full h-full flex flex-col overflow-y-auto">
          <div className="w-full rounded-t-md bg-blue-500 py-2 px-3.5 text-white text-base font-normal tracking-wider">
            Connected Wallets
          </div>
          <div className="my-3 px-3 space-y-3">
            {readyAccounts.map((a) => (
              <button
                key={a.address}
                onClick={onClickCopy(a.address)}
                className={`${styles.btn} border border-gray-300 rounded-md`}
              >
                <div className="shrink-0">
                  <Identicon address={a.address} size={40} />
                </div>
                <div className="flex flex-col mx-3 items-start">
                  <div className="text-gray-800 text-sm font-normal">
                    {a.connectorName || 'Wallet'}
                  </div>
                  <div className="text-xs truncate w-64">{a.address ? a.address : 'Unknown'}</div>
                </div>
              </button>
            ))}
            <button onClick={onConnectWallet} className={styles.btn}>
              <Icon src={Wallet} alt="" size={18} className="invert" />
              <div className="ml-2">Connect wallet</div>
            </button>
            <button onClick={onClickDisconnect} className={styles.btn}>
              <Icon src={Logout} alt="" size={20} />
              <div className="ml-2">Disconnect all wallets</div>
            </button>
          </div>
          <div className="w-full bg-blue-500 py-2 px-3.5 mb-4 text-white text-base font-normal tracking-wider">
            Transfer History
          </div>
          {/* <div className="flex grow flex-col px-3.5">
            <div className="grow flex flex-col w-full">
              {sortedTransfers?.length > 0 &&
                sortedTransfers.map((t) => (
                  <button
                    key={t.timestamp}
                    onClick={() => {
                      setSelectedTransfer(t);
                      setIsModalOpen(true);
                    }}
                    className="flex justify-between items-center rounded-md border border-gray-300 px-2.5 py-2 mb-3 hover:bg-gray-100 active:bg-gray-200 transition-all duration-500"
                  >
                    <div className="flex">
                      <div className="mr-2.5 flex flex-col items-center justify-center rounded-full bg-gray-100 h-[2.25rem] w-[2.25rem] p-1.5">
                        <ChainLogo chainCaip2Id={t.params.originCaip2Id} size={20} />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex flex-col">
                          <div className="flex items items-baseline">
                            <span className="text-gray-800 text-sm font-normal">
                              {t.params.amount}
                            </span>
                            <span className="text-gray-800 text-sm font-normal ml-1">
                              {getToken(t.params.tokenCaip19Id)?.symbol || ''}
                            </span>
                            <span className="text-black text-xs font-normal ml-1">
                              ({toTitleCase(getAssetNamespace(t.params.tokenCaip19Id))})
                            </span>
                          </div>
                          <div className="mt-1 flex flex-row items-center">
                            <span className="text-thin text-gray-900 font-normal tracking-wide">
                              {getChainDisplayName(t.params.originCaip2Id, true)}
                            </span>
                            <Image
                              className="mx-1"
                              src={ArrowRightIcon}
                              width={10}
                              height={10}
                              alt=""
                            />
                            <span className="text-thin text-gray-900 font-normal tracking-wide">
                              {getChainDisplayName(t.params.destinationCaip2Id, true)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-6 h-6">
                      {STATUSES_WITH_ICON.includes(t.status) ? (
                        <Image
                          src={getIconByTransferStatus(t.status)}
                          width={25}
                          height={25}
                          alt=""
                        />
                      ) : (
                        <SmallSpinner />
                      )}
                    </div>
                  </button>
                ))}
            </div>
            {sortedTransfers?.length > 0 && (
              <button onClick={resetTransfers} className="flex flex-row items-center my-6">
                <Image className="mr-4" src={ResetIcon} width={17} height={17} alt="" />
                <span className="text-gray-900 text-sm font-normal">Reset transaction history</span>
              </button>
            )}
          </div> */}
          {/* <div className="flex grow flex-col w-full">
            {notifications.length > 0 &&
              notifications.map((notification) => (
                <div
                  key={notification.sid}
                  className="flex justify-between items-center rounded-md border border-gray-300 px-2.5 py-2 mb-3 hover-bg-gray-100 active-bg-gray-200 transition-all duration-500"
                >
                  
                  <div className="flex">
               
                    <div className="mr-2.5 flex flex-col items-center justify-center rounded-full bg-gray-100 h-[2.25rem] w-[2.25rem] p-1.5">
                      {notification.icon ? (
                        <Image src={notification.icon} width={20} height={20} alt="" />
                      ) : (
                        <ChainLogo chainCaip2Id={notification.blockchain} size={20} />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex flex-col">
                        <div className="flex items items-baseline">
                          <span className="text-gray-800 text-sm font-normal">
                            {notification.title || ''}
                          </span>
                          <button>
                            <span className="text-gray-800 text-sm font-normal ml-1">
                              {notification.message || ''}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div> */}
          <div className="flex grow flex-col w-full items-center">
            {notifications.length > 0 &&
              notifications.map((notification) => (
                <div
                  key={notification.sid}
                  className="flex flex-col items-center rounded-md border border-gray-300 px-2.5 py-2 mb-3 hover-bg-gray-100 active-bg-gray-200 transition-all duration-500"
                  style={{ width: '300px' }} // Set a fixed width for the notification container
                >
                  <div className="flex flex-col items-center">
                    <div className="mb-2 mr-2.5 flex flex-col items-center justify-center rounded-full bg-gray-100 h-[2.25rem] w-[2.25rem] p-1.5">
                      {notification.icon ? (
                        <Image src={notification.icon} width={30} height={30} alt="" />
                      ) : (
                        <ChainLogo chainCaip2Id={notification.blockchain} size={20} />
                      )}
                    </div>
                    <span className="text-gray-800 text-sm font-semibold text-center mb-2">
                      {' '}
                      {/* Center-align text */}
                      {notification.title || 'Title'}
                    </span>
                  </div>
                  <button
                    onClick={() => window.open(notification.message, '_blank')}
                    className="text-white bg-blue-500 hover:bg-blue-600 py-2 px-3 rounded w-full" // Set a fixed width for the button and center-align it
                  >
                    Pay Now
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
      {selectedTransfer && (
        <TransfersDetailsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTransfer(null);
          }}
          transfer={selectedTransfer}
        />
      )}
    </>
  );
}

function Icon({
  src,
  alt,
  size,
  className,
}: {
  src: any;
  alt?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center w-[20px] ${className}`}>
      <Image src={src} alt={alt || ''} width={size ?? 16} height={size ?? 16} />
    </div>
  );
}

const styles = {
  btn: 'w-full flex items-center px-2.5 py-2 text-sm hover:bg-gray-100 active:bg-gray-200 rounded transition-all duration-500',
};
