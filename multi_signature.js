const { AccountCreateTransaction, Hbar, Client, PrivateKey, KeyList, TransferTransaction } = require("@hashgraph/sdk")

// Acount 1
const account1 = PrivateKey.fromString("302e020100300506032b6570042204208b29e8ddaa5c970738958e2196a35e7c95ee65ba6cc4b67a43de6db18c0e3a95")
const account1Id = "0.0.4567771"

// Acount 2
const account2 = PrivateKey.fromString("302e020100300506032b6570042204202ffaa53b5b04a95bd87cf0fa5663ec291271f45f518c4c46594d9474399e8ba7")
const account2Id = "0.0.4567772"

// Acount 3
const account3 = PrivateKey.fromString("302e020100300506032b657004220420dfd98401aada994e9191b8498072037bb4809337f7bda9fab0bada0e4fdaf2d4")
const account3Id = "0.0.4567773"

// Acount 4
const account4 = PrivateKey.fromString("302e020100300506032b657004220420c7995380ca9d3077b7fdb09fa4f6ade0593b92a6f5fa6b0cd70e55e127b1c7cb")
const account4Id = "0.0.4567774"

const client = Client.forTestnet();
client.setOperator(account1Id, account1);

const publicKeys = [
    account1.publicKey,
    account2.publicKey,
    account3.publicKey
]

const newKey = new KeyList(publicKeys, 2)

async function createWallet(){
    let tx = await new AccountCreateTransaction()
        .setKey(newKey)
        .setInitialBalance(new Hbar(20))
        .execute(client);

    return (await tx.getReceipt(client)).accountId

}

async function spendFail(accId){
    const tx = await new TransferTransaction()
        .addHbarTransfer(accId, new Hbar(-10))
        .addHbarTransfer(account4Id, new Hbar(10))
        .freezeWith(client)
        .sign(account1);

    const executed =await (await tx.execute(client)).getReceipt(client);
    return executed
}

async function spend(accId){
    const tx = await (await new TransferTransaction()
        .addHbarTransfer(accId, new Hbar(-10))
        .addHbarTransfer(account4Id, new Hbar(10))
        .freezeWith(client)
        .sign(account1)).sign(account2);

    const executed =await (await tx.execute(client)).getReceipt(client);
    return executed
}

async function main(){
    const accountId = await createWallet();
    console.log(`${accountId}`)
    await spendFail(accountId).catch((err) => console.error(`Error: ${err}`))
    const tx = await spend(accountId);
    console.log(tx)
    process.exit()
}


main()