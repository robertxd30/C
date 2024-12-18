const fs = require('fs')
const Bip39 = require('bip39');
const ed25519 = require('ed25519-hd-key');
// const bs58 = require("bs58")
const {Keypair, Connection} = require("@solana/web3.js")

const sleep = (ms) => {return new Promise(resolve => setTimeout(resolve, ms))}
const api = ""

const conn = new Connection(`https://mainnet.helius-rpc.com/?api-key=${api}`,"max")
const importFileName = './wallet.txt'
const exportFileName = './result.txt'
const timeDelay = 10 //second

let WalletList = []

const loadWallet = () => {
    try{
        const fileName = importFileName
        const rawData = fs.readFileSync(fileName, 'utf-8')
        WalletList = rawData.split(/\r?\n/)
        console.log("Wallet Count: ", WalletList.length)
    }catch(err){
        console.log(err)
    }
}

async function main() {
    loadWallet()
    for(let item of WalletList){
        try{
            const seed = Bip39.mnemonicToSeedSync(item)
            const derivePath = `m/44'/501'/0'/0'`
            const derivedSeed = ed25519.derivePath(derivePath, seed.toString('hex')).key;
            const wallet = Keypair.fromSeed(derivedSeed)
            let balance = 0
            try{
                balance = Math.floor((await conn.getBalance(wallet.publicKey))/10**6) / 1000
            }catch(err){
                console.log(err)
            }
            const line = balance + "     " + item + "    :     "+wallet.publicKey.toBase58() + "\r\n"
            console.log(line)
            fs.appendFileSync(exportFileName, line)
            await sleep(timeDelay * 1000)
        }catch(errors){
            console.log(errors)
        }
    }
}

main()
