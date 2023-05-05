const {
    TransferTransaction,
    Client,
    ScheduleCreateTransaction,
    ScheduleDeleteTransaction,
    PrivateKey,
    Hbar, ScheduleInfoQuery, ScheduleSignTransaction
} = require("@hashgraph/sdk");


const account3Id = "0.0.4567773";
const account3 = PrivateKey.fromString("302e020100300506032b657004220420dfd98401aada994e9191b8498072037bb4809337f7bda9fab0bada0e4fdaf2d4");

const otherAccountId = "0.0.4567771";
const otherAccountId2 = "0.0.4567772";

const client = Client.forTestnet();

client.setOperator(account3Id, account3);


async function createScheduleTransaction() {
    const transferTransaction = new TransferTransaction()
        .addHbarTransfer(otherAccountId, Hbar.fromTinybars(-104))
        .addHbarTransfer(otherAccountId2, Hbar.fromTinybars(104));

    const scheduleTransaction = await new ScheduleCreateTransaction()
        .setScheduledTransaction(transferTransaction)
        .setAdminKey(account3)
        .execute(client);

    const scheduledTxReceipt = await scheduleTransaction.getReceipt(client);
    return scheduledTxReceipt;
}

async function main() {
    const schedule = await createScheduleTransaction();
    console.log("The schedule ID is " + schedule.scheduleId);

    //Get the scheduled transaction ID
    const scheduledTxId = schedule.scheduledTransactionId;
    console.log("The scheduled transaction ID is " + scheduledTxId);

    //Create the transaction and sign with the admin key
    const transaction = await new ScheduleDeleteTransaction()
        .setScheduleId(schedule.scheduleId)
        .freezeWith(client)
        .sign(account3);

    //Sign with the operator key and submit to a Hedera network
    const txResponse = await transaction.execute(client);

    //Get the transaction receipt
    const receipt = await txResponse.getReceipt(client);

    //Get the transaction status
    const transactionStatus = receipt.status;
    console.log("The transaction consensus status is " + transactionStatus);


    try {
        const scheduledSignTransaction = await new ScheduleSignTransaction()
            .setScheduleId(schedule.scheduleId)
            .freezeWith(client)
            .sign(account3);


        const txResponse1 = await scheduledSignTransaction.execute(client);
        const receipt1 = await txResponse1.getReceipt(client);
        //Get the transaction status - should fail
        const transactionStatus1 = receipt1.status;
        console.log("The transaction consensus status is " + transactionStatus1);
    } catch (err) {
        console.error(`Error: ${err}`)
    }
    ;




    process.exit();
}

main();