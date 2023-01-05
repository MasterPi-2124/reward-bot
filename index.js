const express = require('express')
const app = express()
const Bot = require('./utils/worker')
const fs = require('fs');

const port = 3000
require('dotenv').config()
rpcString = process.env.RPC_INTERNAL

const bot = new Bot()

app.get('/', async (_, res) => {
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
    while (1) {
        await bot.work()
    }
})

