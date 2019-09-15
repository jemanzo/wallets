const path = require('path')
const Wallet = require(path.join(__dirname, 'wallet.js'))
const Config = require(path.join(__dirname, 'config.js'))

class Wallets extends Array {
  constructor (config, _parent) {
    super()
    this.coin = ''
    this.setConfig(config)
    Object.defineProperty(this, '_parent', { value: _parent, writable: true, enumerable: false, configurable: false })
  }
  createWallet (name) {
    const wlt = new Wallet(name, this.config)
    this.push(wlt)
    return wlt
  }
  setConfig (config) {
    this.config = new Config(config)
  }
}

module.exports = Wallets
