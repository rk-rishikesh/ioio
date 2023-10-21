import { PushAPI } from '@pushprotocol/restapi';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

async function init(signer) {
  const userAlice = await PushAPI.initialize(signer, { env: 'staging' });
  console.log('userAlice', userAlice);
  const inboxNotifications = await userAlice.notification.list('INBOX');
  console.log('inboxNotifications', inboxNotifications);
}

function Temp() {
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // Request access to the user's MetaMask account
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then((accounts) => {
          // You can now access the signer
          const selectedAddress = accounts[0];
          const connectedSigner = provider.getSigner(selectedAddress);
          console.log('connectedSigner', connectedSigner);
          setSigner(connectedSigner);
        })
        .catch((err) => {
          console.error('Error connecting to MetaMask:', err);
        });
    } else {
      console.error('MetaMask is not installed');
    }
  }, []);

  useEffect(() => {
    if (signer) {
      init(signer);
    }
  }, [signer]);

  return (
    <div>
      <h1>Temp</h1>
      <h1>Temp</h1>
      <h1>Temp</h1>
      <h1>Temp</h1>
      <h1>Temp</h1>
      <h1>Temp</h1>
      <h1>Temp</h1>
      <h1>Temp</h1>
      <h1>Temp</h1>
      <h1>Temp</h1>
    </div>
  );
}

export default Temp;
