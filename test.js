const { Wallet,ethers } = require('ethers');
const { Client } = require('@xmtp/xmtp-js');

const sendNotification = async () => {
    try {
        const presigner=ethers.Wallet.createRandom()
        console.log(presigner.privateKey)

        const signer = new Wallet(presigner.privateKey);
        const xmtp = await Client.create(signer);
        const conversation = await xmtp.conversations.newConversation(
            '0x7935468Da117590bA75d8EfD180cC5594aeC1582',
        );
        const sent=await conversation.send('gm');
        console.log(sent.sent)
    } catch (error) {
        console.log(error);
    }
};
sendNotification()