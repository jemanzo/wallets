const path = require('path')
const crypto = require('crypto')
const cryptools = require(path.join(__dirname, 'cryptools.js'))
const WalletKey = require(path.join(__dirname, 'key.js'))
const Address = require(path.join(__dirname, 'address.js'))

class Wallet {
  constructor (name, _config) {
    this.name = name || 'default'
    this.descr = ''
    this.coin = ''
    this.version = 0
    this.address = ''
    Object.defineProperty(this, '_config', { value: _config, writable: true, enumerable: false, configurable: false })
  }
  isValid () {
    return Address.addressIsValid(this.address, this._config.base58)
  }
  generateKeys () {
    this.resetKeys()
    this.setPrivateKey(WalletKey.createPrivateKey())
  }
  setAddress (address) {
    delete this.privkey
    this.resetPubKey()
    this.address = address
    const pubkey = Address.addressToPubKeyHash(this.address, this._config.base58)
    this.pubkey.version = pubkey.version
    this.pubkey.data = null
    this.pubkey.hash = pubkey.hash
    this.pubkey.checksum = pubkey.checksum
  }
  setPublicKeyScript (script) {
    if (typeof script === 'string') {
      script = Buffer.from(script, 'hex')
    }
    if (!Buffer.isBuffer(script)) {
      throw new TypeError('Wallet.loadScriptPublicKey(script): must be a string or a buffer')
    }
    if (script.slice(0, 1).readUInt8() === 33) {
      this.setPublicKey(script.slice(1, 34))
      this.updateAddress()
    }
  }
  setPublicKey (pubkey) {
    this.pubkey.data = Buffer.from(pubkey, 'hex')
    this.updateAddress()
  }
  setPublicKeyHash (pubkeyHash) {
    this.pubkey.hash = Buffer.from(pubkeyHash, 'hex')
    this.updateAddress()
  }
  getPrivateKeyBase58 () {
    var privkey = Buffer.concat([Buffer.of(this.privkey.version), this.privkey.data, this.privkey.flag])
    this.privkey.checksum = cryptools.sha256d(privkey).slice(0, 4)
    privkey = Buffer.concat([privkey, this.privkey.checksum])
    return this._config.base58.encode(privkey)
  }
  setPrivateKeyBase58 (privkey) {
    // https://royalforkblog.github.io/2014/08/11/graphical-address-generator/#hello
    // https://en.bitcoin.it/wiki/Elliptic_Curve_Digital_Signature_Algorithm
    // https://en.bitcoin.it/wiki/Secp256k1
    privkey = this._config.base58.decode(privkey)
    const checksum = cryptools.sha256d(privkey.slice(0, 34)).slice(0, 4)
    if (checksum.compare(privkey.slice(-4)) !== 0) {
      throw new Error('Wallet.setPrivateKeyBase58(privkey): privkey checksum error!')
    }
    this.privkey.version = Buffer.from(privkey.slice(0, 1))
    this.privkey.flag = Buffer.from(privkey.slice(33, 34)) // compression flag
    this.privkey.checksum = checksum
    this.setPrivateKey(privkey.slice(1, 33))
  }
  setPrivateKey (privkey) {
    if (!Buffer.isBuffer(privkey) || privkey.length !== 32) {
      throw new TypeError('Wallet.setPrivateKey: private key must be a 32 bytes buffer')
    }
    if (!WalletKey.validatePrivateKey(privkey)) {
      throw new TypeError('Wallet.setPrivateKey: invalid private key')
    }
    this.privkey.data = Buffer.from(privkey)
    this.updatePubKey(true)
    this.updateAddress()
  }
  getP2SH () {
    // Pay to Script Hash
    // OP_DUP OP_HASH160 0099579aebca87c77b9dee8eb3fe6869e67309c7 OP_EQUALVERIFY OP_CHECKSIG
    return `'76a914${this.pubkey.hash.hexSlice()}88ac`
  }
  updateAddress () {
    this.updatePubKeyHash()
    this.address = Address.addressFromPubKeyHash(this.pubkey.version, this.pubkey.hash, this._config.base58)
  }
  updatePubKey (compress) {
    const secp256k1 = crypto.createECDH('secp256k1')
    secp256k1.setPrivateKey(this.privkey.data);
    (compress)
      ? this.pubkey.data = secp256k1.getPublicKey(null, 'compressed')
      : this.pubkey.data = secp256k1.getPublicKey(null, 'uncompressed')
    this.pubkey.flag = this.pubkey.data.slice(0, 1)
    this.updatePubKeyHash()
  }
  updatePubKeyHash () {
    // PublicKey must be in compressed mode
    if (Buffer.isBuffer(this.pubkey.data) && this.pubkey.isCompressed()) {
      this.pubkey.hash = cryptools.sha256(this.pubkey.data)
      this.pubkey.hash = crypto.createHash('ripemd160').update(this.pubkey.hash).digest()
      return true
    }
    return false
  }
  resetKeys () {
    this.resetPubKey()
    this.resetPrivKey()
  }
  resetPubKey () {
    this.pubkey = new WalletKey()
    this.pubkey.version = this._config.pubkeyVersion
  }
  resetPrivKey () {
    this.privkey = new WalletKey()
    this.privkey.version = this._config.privkeyVersion
    this.privkey.flag = Buffer.of(1)
  }
}

module.exports = Wallet
