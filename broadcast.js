const ethers = require("ethers");
const { Client } = require("@xmtp/xmtp-js");

//Rate limits
//1k publish request /5 minutes per wallet
//publish request would be Client.create() , send() and newConversation()
//10k of any request type / 5 mins

async function main() {
  //Create a random wallet for example purposes. In frontend you should replace with the user's wallet (metamask, rainbox, etc)
  const wallet = ethers.Wallet.createRandom();
  //Initialize the xmtp client
  const xmtp = await Client.create(wallet);
  console.log("Broadcasting from: ", xmtp.address);

  //In this example we are going to broadcast to the GM_BOT (already in the network) and a random wallet (not in the network)
  const GM_BOT = "0x937C0d4a6294cdfa575de17382c7076b579DC176";
  const test = ethers.Wallet.createRandom();
  const broadcasts_array = [GM_BOT, test.address];

  //Querying the protocol status of the wallets
  const broadcasts_canMessage = await Client.canMessage(broadcasts_array);
  for (let i = 0; i < broadcasts_array.length; i++) {
    //Checking each wallet status
    const wallet = broadcasts_array[i];
    const canMessage = broadcasts_canMessage[i];
    console.log(wallet, canMessage);
    if (broadcasts_canMessage[i]) {
      //If in the network, start
      const conversation = await xmtp.conversations.newConversation(wallet);
      // Send a message
      const sent = await conversation.send("gm");
      console.log(sent.sent);
    }
  }
}
main();
