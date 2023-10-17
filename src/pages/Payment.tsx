import CryptoJS from 'crypto-js';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';

import { TipCard } from '../components/tip/TipCard';
import { TransferTokenCard } from '../features/transfer/TransferTokenCard';

const secretKey = 'secretKey';
// Retrieve the encrypted data from the URL
// const encryptedData = new URLSearchParams(window.location.search).get('data');

// // Decrypt the data
// const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
// const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

// console.log(decryptedData);

const payment: NextPage = () => {
  const [invoiceDetails, setInvoiceDetails] = useState({
    billerAddress: '',
    clientWalletAddress: '',
    totalAmount: 0,
    currency: '',
  });

  useEffect(() => {
    // Retrieve the encrypted data from the URL
    const encryptedData = new URLSearchParams(window.location.search).get('data');
    // console.log('encryptedData', encryptedData);

    if (encryptedData) {
      // Decrypt the data
      const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      console.log('decryptedData', decryptedData);
      // Update the state with decrypted data
      setInvoiceDetails({
        billerAddress: decryptedData.billerAddress || '',
        clientWalletAddress: decryptedData.clientWalletAddress || '',
        totalAmount: parseFloat(decryptedData.totalAmount) || 0,
        currency: decryptedData.currency || '',
      });
    }
  }, []);

  // console.log('invoiceDetails', invoiceDetails);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="space-y-2">
        <TipCard />
        <TransferTokenCard invoiceDetails={invoiceDetails} />
      </div>
    </div>
  );
};

export default payment;
