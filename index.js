const express = require('express')
const app = express()
const Bot = require('./utils/worker')
const fs = require('fs');

const port = 3000
require('dotenv').config()
rpcString = process.env.RPC_INTERNAL

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const bot = new Bot()

app.get('/', (_, res) => {
    fs.readFile('./data.json', (err, data) => {
        if (err) {
            res.json({
                err: 'fail to fetch data: ' + err.message
            })
        }
        const result = JSON.parse(data)
        res.json(result)
    });
})

app.listen(port, async () => {
    console.log(`Example app listening on port ${port}`)
})

sleep(5000).then(async () => {
    while (1) {
       await bot.work()
    }
});


