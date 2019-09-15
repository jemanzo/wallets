// ======================= //
// WALLET CONSOLE DEMO     //
// ======================= //

const path = require('path')
const consoleTool = require('./console.js')
const Wallets = require(path.join(__dirname, '../src'))

const wallets = new Wallets({
  addressVersion: 18,
  privkeyVersion: 146,
  base58Str: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
})

const wallet = wallets.createWallet('bitconnect')
wallet.generateKeys()
console.log(wallet)

const message = `
  Welcome to Wallets service!
  type "wallet" and press "Enter" to see your wallet infos
  type "wallet." and press "TAB" twice to see your wallet options
  type ".exit" to quit
`

// REPL CONSOLE
consoleTool.open('crypto-wallets', { wallets, wallet }, message)
