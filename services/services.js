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
        const [err, data] = await to(axios.get(`${this.url}/block/${hash}/txs/${startIndex}`));
        if(err) {
            return ["error", null]
        }
        const txs = [];
        data.data.map(({txid, vin}) => {
            const _vin = vin.map(x => x.txid);
            txs.push(
                {
                    txid, vin: _vin
                }
            )
        })

        return [null, txs];
    }

    static async getBlockAllTransactions(hash) {
        const txs = [];
        let index = 0;
        let hasNext = true;

        while(hasNext) {
            const [, data] = await this.getBlockTransactions(hash, index);
            if (data) {
                txs.push(...data);
                if (data.length === 25) {
                    // make more call
                    index += data.length;
                } else {
                    hasNext = false;
                }
            } else {
                hasNext = false;
            }

            // // add this for faster return
            // if(txs.length > 2000) {
            //     return txs;
            // }
        }

        return txs;
    }
}

module.exports = Services;
