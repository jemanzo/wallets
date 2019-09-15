const BASE58STR = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const BASE58 = new Map()

class WalletConfig {
  constructor (config) {
    this.pubkeyVersion = 0x00 // number(0) - bitcoin Pubkey hash (P2PKH address)
    this.scriptVersion = 0x05 // number(5) - bitcoin Script hash (P2SH address)
    this.privkeyVersion = 0x80 // number(128) - bitcoin Private key (WIF, uncompressed pubkey)
    this.leadingSymbol = '' // ex. '1' -> addresses first expected char(s) '19DHWNuJUKun3toAmPu6HvRbq9mh7UcDSa'
    this.base58Str = BASE58STR
    Object.defineProperty(this, 'base58', {
      get () {
        let fn = BASE58.get(this.base58Str)
        if (!fn) {
          fn = require('base-x')(this.base58Str)
          BASE58.set(this.base58Str, fn)
        }
        return fn
      },
      enumerable: false,
      configurable: false })
    if (config) { this.import(config) }
    Object.freeze(this)
  }
  import (walletConfig) {
    // addressVersion
    if (Number.isSafeInteger(walletConfig.addressVersion) && walletConfig.addressVersion >= 0) {
      this.addressVersion = walletConfig.addressVersion
    } else { throw new Error('WalletConfig.import(walletConfig): addressVersion must be a positive integer') }
    // privkeyVersion
    if (Number.isSafeInteger(walletConfig.privkeyVersion) && walletConfig.privkeyVersion >= 0) {
      this.privkeyVersion = walletConfig.privkeyVersion
    } else { throw new Error('WalletConfig.import(walletConfig): privkeyVersion must be a positive integer') }
    // leadingSymbol <optional>
    if (walletConfig.hasOwnProperty('leadingSymbol')) {
      if (typeof walletConfig.leadingSymbol === 'string') {
        this.leadingSymbol = walletConfig.leadingSymbol
      } else { throw new Error('WalletConfig.import(walletConfig): leadingSymbol must be a string') }
    } else { this.leadingSymbol = '' }
    // base58Str <optional>
    if (walletConfig.hasOwnProperty('base58Str')) {
      if (typeof walletConfig.base58Str === 'string' && walletConfig.base58Str.length === 58) {
        this.base58Str = walletConfig.base58Str
      } else { throw new Error('WalletConfig.import(walletConfig): base58Str must be a string with 58 chars') }
    } else { this.base58Str = BASE58STR }
  }
  exportStr () {
    return JSON.stringify(this)
  }
}

module.exports = WalletConfig

// https://en.bitcoin.it/wiki/List_of_address_prefixes
