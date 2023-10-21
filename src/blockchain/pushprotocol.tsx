import { PushAPI } from '@pushprotocol/restapi';
import { ethers } from 'ethers';

const _signer = new ethers.Wallet(
  '0x9b2d1f23d1831949ccf603490528ec2ea407d87dbb3f49baa8a851133761ba41',
);

async function getNotifications(signer) {
  const userAlice = await PushAPI.initialize(signer, { env: 'staging' });
  console.log('userAlice', userAlice);
  const inboxNotifications = await userAlice.notification.list('SPAM');
  console.log('inboxNotifications', inboxNotifications);
  return inboxNotifications;
}

async function Notify(address, title, body) {
  const mainUser = await PushAPI.initialize(_signer, { env: 'staging' });
  console.log('mainUser', mainUser);

  const response = await mainUser.channel.send([address], {
    notification: {
      title: title,
      body: body,
    },
  });

  console.log(response);
}

export { Notify, getNotifications };
