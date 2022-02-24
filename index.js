const axios = require('axios');
const to = require("await-to-js");
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

async function findMaxAncestorySetsTransactions(num) {
    const [err, txs] = await computeTransactions(680000);
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

    // txs.map(tx => )

    txs.map(({txid, vin}) => {
        traversedTransactions[txid] = {
            done: false,
            parentCount: 0,
            vin
        };
    })

    // recursively traverse all transactions
    for(let i=0; i<txs.length; i++) {
        let tx = txs[i];
        if(!traversedTransactions[tx.txid].done) { // if haven't traversed
            traverse(tx.txid);
        }
    }

    // find max 10 transactions

    traversedTransactions.sort((a, b) => {
        return a.parentCount - b.parentCount
    })

    return traversedTransactions.slice(0, num);
}

// traverse a transaction, and return the parent count, 0 for the root node
function traverse(txid) {

    const tx = traversedTransactions[txid];

    // find all the parents and push them to traverse
    const toTraverseParents = tx.vin.filter(({txid}) => traversedTransactions[txid].done === false)
    let maxpc = tx.parentCount;

    toTraverseParents.map(({txid}) => {
        let pc = traverse(txid);
        maxpc = Math.max(pc, maxpc);
    });

    tx.parentCount = maxpc;

    return tx.parentCount;
}


findMaxAncestorySetsTransactions(10).then(console.log).catch(console.log);
