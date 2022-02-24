const axios = require('axios');
const to = require("await-to-js").default;

/*
some of the apis to consider

GET /block/:hash/txs[/:start_index]
GET /block/:hash
GET /block-height/:height
 */


class Services {
    static url = 'https://blockstream.info/api'; // can put in env
    static async getBlockHashFromBlockHeight(blockHeight) {
        const [err, data] = await to(axios.get(`${this.url}/block-height/${blockHeight}`));
        return [err, data.data];
    }

    static async getBlockInfo(hash) {
        const [err, data] = await to(axios.get(`${this.url}/block/${hash}`));
        return [err, data.data];
    }

    static async getBlockTransactions(hash, startIndex) {
        const [err, data] = await to(axios.get(`${this.url}/block/${hash}/txs/[${startIndex}]`));
        return [err, data.data];
    }
}

module.exports = Services;