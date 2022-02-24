const Services = require("./services/services");

// returns list of all transactions
async function computeTransactions(blockHeight) {

    const [, blockHash] = await Services.getBlockHashFromBlockHeight(blockHeight)
    if(blockHash) {
        const txs = await Services.getBlockAllTransactions(blockHash);
        return [null, txs]
    } else {
        return ["error", null];
    }

}

// TODO: no global
let traversedTransactions = {};

// transaction format:
/*
        [tx]
        tx: {
            txid,
            vin: [
                       {
                        "txid"
                       }
                  ],
            vout: [] // na
        }
     */
async function findMaxAncestorySetsTransactions(num) {
    const [err, txs] = await computeTransactions(680000);

    txs.map(({txid, vin}) => {
        traversedTransactions[txid] = {
            done: false,
            parentCount: 0,
            vin
        };
    })

    // recursively traverse all transactions
    txs.map(x => traverse(x.txid));

    // find max 10 transactions
    const transactions = [];
    let keys = Object.keys(traversedTransactions);
    for(const key of keys) {
        transactions.push({txid: key, ...traversedTransactions[key]});
    }

    transactions.sort((a, b) => {
        return b.parentCount - a.parentCount
    })

    return transactions.slice(0, num);
}

// traverse a transaction, and return the parent count, 0 for the root node
function traverse(txid) {

    const tx = traversedTransactions[txid];
    if(!tx) return 0;

    if(tx.done) return tx.parentCount;

    // find all the parents and push them to traverse
    let maxpc = tx.parentCount;

    tx.vin.map((parentTxId) => {
        maxpc = Math.max(1 + traverse(parentTxId), maxpc);
    });

    tx.parentCount = maxpc;
    tx.done = true;

    return tx.parentCount;
}


findMaxAncestorySetsTransactions(10).then((data) => {
    console.log('======================== Transactions: =========================')
    data.map(x => console.log({txid: x.txid, pc: x.parentCount}));
    console.log('=================================================================')
}).catch(console.log);
