const { PrivateKey, Client, TokenCreateTransaction, Hbar, TokenType, TokenSupplyType, TokenAssociateTransaction, TransferTransaction, TokenPauseTransaction, TokenUnpauseTransaction, CustomRoyaltyFee, CustomFixedFee, TokenMintTransaction } = require("@hashgraph/sdk");

// Acount 1
const account1 = PrivateKey.fromString("302e020100300506032b6570042204208b29e8ddaa5c970738958e2196a35e7c95ee65ba6cc4b67a43de6db18c0e3a95")
const account1Id = "0.0.4567771"

// Acount 2
const account2 = PrivateKey.fromString("302e020100300506032b6570042204202ffaa53b5b04a95bd87cf0fa5663ec291271f45f518c4c46594d9474399e8ba7")
const account2Id = "0.0.4567772"

// Acount 3
const account3 = PrivateKey.fromString("302e020100300506032b657004220420dfd98401aada994e9191b8498072037bb4809337f7bda9fab0bada0e4fdaf2d4")
const account3Id = "0.0.4567773"


const client = Client.forTestnet();
client.setOperator(account1Id, account1);
client.setDefaultMaxTransactionFee(new Hbar(100));

async function createToken() {
    const customFee = new CustomRoyaltyFee({
        feeCollectorAccountId: account2Id,
        fallbackFee: new CustomFixedFee().setHbarAmount(new Hbar(200)),
        numerator: 10,
        denominator: 100
    })

    const tx = await new TokenCreateTransaction()
        .setTokenName("Cert Token")
        .setTokenSymbol("CT")
        .setTokenType(TokenType.NonFungibleUnique)
        .setSupplyType(TokenSupplyType.Finite)
        .setInitialSupply(0)
        .setMaxSupply(5)
        .setDecimals(0)
        .setTreasuryAccountId(account1Id)
        .setAdminKey(account1)
        .setPauseKey(account1)
        .setSupplyKey(account2)
        .setCustomFees([customFee])
        .freezeWith(client)
        .sign(account1);

    const txSubmit = await tx.execute(client);
    const receipt = await txSubmit.getReceipt(client);
    console.log(`Created token: ${receipt.tokenId}`);
    return receipt.tokenId.toString();
}

async function allowRecive(tokenId, accountId, accountKey) {
    const tx = await new TokenAssociateTransaction()
        .setAccountId(accountId)
        .setTokenIds([tokenId])
        .freezeWith(client)
        .sign(accountKey);

    const txSubmit = await tx.execute(client);
    return await txSubmit.getReceipt(client)
}

async function mintToken(tokenId) {
    const receipts = [];

    for await (const iterator of Array.apply(null, Array(5)).map((x, i) => i)) {
        const mintTx = new TokenMintTransaction()
            .setTokenId(tokenId)
            .setMetadata([Buffer.from([`NFT ${iterator}`])])
            .freezeWith(client);

        const mintTxSign = await mintTx.sign(account2);
        const mintTxSubmit = await mintTxSign.execute(client);
        const mintRx = await mintTxSubmit.getReceipt(client);

        receipts.push(mintRx);
    }

    return receipts;
}

async function transferTokens(tokenId){
    const txId = await new TransferTransaction()
        .addNftTransfer(tokenId, 2, account1Id, account3Id)
        .execute(client);

    return (await txId.getReceipt(client))
}

async function main() {
    let tokenId = await createToken();
    
    // Allow account3 and account4 to recive token
    await allowRecive(tokenId, account3Id, account3);

     await mintToken(tokenId);
    const tx = await transferTokens(tokenId);
    console.log(tx)

    process.exit()
}

main()