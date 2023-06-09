const { Client, PrivateKey, TopicCreateTransaction, TopicMessageSubmitTransaction, Hbar } = require("@hashgraph/sdk");

// Acount 1
const account1 = PrivateKey.fromString("302e020100300506032b6570042204208b29e8ddaa5c970738958e2196a35e7c95ee65ba6cc4b67a43de6db18c0e3a95")
const account1Id = "0.0.4567771"

// Acount 2
const account2 = PrivateKey.fromString("302e020100300506032b6570042204202ffaa53b5b04a95bd87cf0fa5663ec291271f45f518c4c46594d9474399e8ba7")
const account2Id = "0.0.4567772"

// Acount 3
const account3 = PrivateKey.fromString("302e020100300506032b657004220420dfd98401aada994e9191b8498072037bb4809337f7bda9fab0bada0e4fdaf2d4")
const account3Id = "0.0.4567773"

const client = Client.forTestnet()
    .setOperator(account1Id, account1)
    .setDefaultMaxTransactionFee(new Hbar(10));

const client2 = Client.forTestnet()
    .setOperator(account2Id, account2)
    .setDefaultMaxTransactionFee(new Hbar(10));

const client3 = Client.forTestnet()
    .setOperator(account3Id, account3)
    .setDefaultMaxTransactionFee(new Hbar(10));

async function createTopic() {
    let txResponse = await new TopicCreateTransaction()
        .setSubmitKey(account1.publicKey)
        .setSubmitKey(account2.publicKey)
        .execute(client);

    let receipt = await txResponse.getReceipt(client);
    return receipt.topicId.toString()
}

async function send_message(topicId, client) {
    const message = new Date().toISOString();

    const response = await new TopicMessageSubmitTransaction({
        topicId,
        message
    }).execute(client);

    let receipt = await response.getReceipt(client);
    console.log(`\nSent message to topic: ${topicId}, message: ${message}`);
    return receipt.status.toString()
}

async function main() {
    let topicId = await createTopic();
    console.log(`Created topic with id: ${topicId}`)
    console.log(`Look at topic messages: https://hashscan.io/testnet/topic/${topicId}`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await send_message(topicId, client3).catch((error) => console.log(`Err: ${error}`));
    await send_message(topicId, client2)
    process.exit()
}

main();