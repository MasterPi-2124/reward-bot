const { specialDenom, chainData } = require('../storage/chainData')
const axios = require('axios')

const SI_prefix = {
    "d": 1,
    "c": 2,
    "m": 3,
    "u": 6,
    "n": 9,
    "p": 12,
    "f": 15,
    "a": 18,
    "z": 21,
    "y": 24
}

module.exports.formatReward = (rewards) => {
    let newRewards = {}
    for (var key in rewards) {
        let newTotal = []
        if (rewards[key].err) {
            newRewards[key] = {
                err: rewards[key].err
            }
            continue
        }
        let api = chainData[key].api_service
        rewards[key].total.map(async total => {
            let newDenom
            if (total.denom.substring(0, 3) === "ibc" && api !== null) {
                newDenom = await getDenom(api, total.denom.substring(4))
            }
            else {
                newDenom = total.denom
            }
            if (newDenom && newDenom !== 'unknow') {
                let displayDenom = getDisplayDenom(newDenom)
                newTotal.unshift({
                    denom: displayDenom,
                    amount: (getValueFromDenom(newDenom, total.amount)).toFixed(2)
                })
            }
        })
        newRewards[key] = {
            total: newTotal
        }
    }
    return newRewards
}

const getAmount = (string, denom) => {
    return (parseInt(string) / Math.pow(10, 24)).toFixed(2)
}

const getDenom = async (api, ibcDenom) => {
    try {
        const { data } = await axios.get(`${api}ibc/apps/transfer/v1/denom_traces/${ibcDenom}`)
        const denom = data.denom_trace ? data.denom_trace.base_denom : "unknown"
        return denom
    }
    catch (e) {
        return 'unknown'
    }
}

const getDisplayDenom = (denom) => {
    if (denom in specialDenom || denom === 'unknown' || !denom) {
        return denom
    }
    else {
        const prefix = denom.substring(0, 1)
        const displayDenom = prefix === 'u'
            || prefix === 'n'
            || prefix === 'a'
            ? denom.substring(1) : denom
        return displayDenom
    }
}

const getValueFromDenom = (denom, value) => {
    let convertValue
    if (denom in specialDenom) {
        const exponent = specialDenom[`${denom}`]
        convertValue = parseInt(value, 10) / Math.pow(10, 18 + exponent)
    }
    else {
        const prefix = denom.substring(0, 1)
        switch (prefix) {
            case 'u':
                convertValue = parseInt(value, 10) / Math.pow(10, 24)
                break
            case 'p':
                convertValue = parseInt(value, 10) / Math.pow(10, 30)
                break
            case 'a':
                convertValue = parseInt(value, 10) / Math.pow(10, 36)
                break
            case 'n':
                convertValue = parseInt(value, 10) / Math.pow(10, 27)
                break
            default:
                convertValue = parseInt(value, 10) / Math.pow(10, 24)
                break
        }
    }
    return convertValue
}