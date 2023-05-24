const ethers = require("ethers");
const fs = require("fs");
const { ThirdwebStorage } = require("@thirdweb-dev/storage");

const storage = new ThirdwebStorage();

const PEER_ADDRESS = "0x937C0d4a6294cdfa575de17382c7076b579DC176";
const { Client } = require("@xmtp/xmtp-js");
const {
  AttachmentCodec,
  RemoteAttachmentCodec,
  ContentTypeAttachment,
  ContentTypeRemoteAttachment,
} = require("xmtp-content-type-remote-attachment");

const encryptLargeFile = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const imgData = new Uint8Array(buffer);

  const attachment = {
    filename: filePath,
    mimeType: "image/png",
    data: imgData,
  };

  const attachmentCodec = new AttachmentCodec();
  const encryptedAttachment = await RemoteAttachmentCodec.encodeEncrypted(
    attachment,
    attachmentCodec
  );
  const uploadData = Buffer.from(encryptedAttachment.payload.buffer);

  const storage = new ThirdwebStorage();
  const uploadUrl = await storage.upload(uploadData);

  console.log("uploadUrl", uploadUrl);
  const remoteAttachment = {
    url: uploadUrl,
    contentDigest: encryptedAttachment.digest,
    salt: encryptedAttachment.salt,
    nonce: encryptedAttachment.nonce,
    secret: encryptedAttachment.secret,
    scheme: "https://",
    filename: attachment.filename,
    contentLength: attachment.data.byteLength,
  };
  console.log(remoteAttachment);
  return remoteAttachment;
};

async function decryptFile(msg, xmtp) {
  RemoteAttachmentCodec.load(msg, xmtp)
    .then((decryptedAttachment) => {
      // Write the decrypted image data to a file
      fs.writeFileSync(
        "decrypted.png",
        new Uint8Array(decryptedAttachment.data)
      );
    })
    .catch((error) => {
      console.error("Failed to load and decrypt remote attachment:", error);
    });
}
async function main() {
  //Create a random wallet for example purposes. In frontend you should replace with the user's wallet (metamask, rainbox, etc)
  const wallet = ethers.Wallet.createRandom();
  //Initialize the xmtp client
  const xmtp = await Client.create(wallet);
  // Create the XMTP client
  // Register the codecs. AttachmentCodec is for local attachments (<1MB)
  xmtp.registerCodec(new AttachmentCodec());
  //RemoteAttachmentCodec is for remote attachments (>1MB) using thirdweb storage
  xmtp.registerCodec(new RemoteAttachmentCodec());
  //Create or load conversation with Gm bot
  const conversation = await xmtp.conversations.newConversation(PEER_ADDRESS);
  //Set the client in the ref

  const remoteAttachment = await encryptLargeFile("xmtp.png", conversation);
  const message = await conversation.send(remoteAttachment, {
    contentType: ContentTypeRemoteAttachment,
    contentFallback: "a screenshot of the xmtp logo",
  });

  decryptFile(message.content, xmtp);
}
main();
