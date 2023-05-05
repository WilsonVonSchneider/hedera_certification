const { PrivateKey, Client, AccountCreateTransaction, TransferTransaction, Hbar } = require("@hashgraph/sdk");

const treasuryAccount = PrivateKey.fromString("302e020100300506032b657004220420221f4e9238ed0802d55c0d817fb03d34337da7a7713902af95df921076c19e2f");
const treasuryId = "0.0.4471558"

const treasuryClient = Client.forTestnet();
treasuryClient.setOperator(treasuryId, treasuryAccount).setDefaultMaxTransactionFee(new Hbar(10));

async function createAccount(n) {
    const newAccountPrivateKey = PrivateKey.generateED25519();
    const tx = await new AccountCreateTransaction()
        .setKey(newAccountPrivateKey)
        .execute(treasuryClient);

    const accountId = (await tx.getReceipt(treasuryClient)).accountId;
    console.log(`- Acount ${n}`);
    console.log(`Private key: ${newAccountPrivateKey}`);
    console.log(`Account ID: ${accountId}\n`);
    return accountId
}

async function fundAccounts(accountIds){
     await new TransferTransaction()
        .addHbarTransfer(treasuryId, new Hbar(-5000))
        .addHbarTransfer(accountIds[0], new Hbar(1000))
        .addHbarTransfer(accountIds[1], new Hbar(1000))
        .addHbarTransfer(accountIds[2], new Hbar(1000))
        .addHbarTransfer(accountIds[3], new Hbar(1000))
        .addHbarTransfer(accountIds[4], new Hbar(1000))
        .execute(treasuryClient)
}

async function main() {
    const accounts = [];
    for (let i = 1; i <= 5; i++) {
        let id = await createAccount(i);
        accounts.push(id)
    }
    
   await fundAccounts(accounts)
    process.exit()
}

main();