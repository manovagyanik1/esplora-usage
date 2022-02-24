const axios = require('axios');
const to = require("await-to-js");
const Services = require("./services/services");

async function compute(blockHeight) {

    const [, blockHash] = await Services.getBlockHashFromBlockHeight(blockHeight)
    if(blockHash) {
        const [, data] = await Services.getBlockTransactions(blockHash, 26);
    } else {

    }
}


compute(680000).then(console.log).catch(console.log);
