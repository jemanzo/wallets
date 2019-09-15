const path = require('path')
const cryptools = require(path.join(__dirname, 'cryptools.js'))

class WalletAddress {
  static addressVersion (addr, base58) {
    return base58.decode(addr).slice(0, 1)
  }
  static addressIsValid (addr, base58) {
    const buff = base58.decode(addr)
    if (buff.length !== 25) { return false }
    if (buff.slice(0, 1).readUInt8() !== this.config.wallet.addressVersion) { return false }
    const checksum = cryptools.sha256d(buff.slice(0, 21))
    return (checksum.slice(0, 4).compare(buff.slice(21)) === 0)
  }
  static addressToPubKeyHash (addr, base58) {
    let buff = base58.decode(addr)
    return {
      version: buff[0],
      hash: buff.slice(1, -4),
      checksum: buff.slice(-4)
    }
  }
  static addressFromPubKeyHash (version, pubkey, base58) {
    let arr = []
    // Version
    if (Number.isInteger(version)) {
      arr.push(Buffer.from(Number(version).toString(16), 'hex'))
    } else throw new TypeError('cryptools.walletAddrFromPubKey(version, pubkey): version must be an integer')
    // Public Key
    if (Buffer.isBuffer(pubkey)) {
      arr.push(pubkey)
    } else if (typeof pubkey === 'string') {
      arr.push(Buffer.from(pubkey, 'hex'))
    } else throw new TypeError('cryptools.walletAddrFromPubKey(version, pubkey): pubkey must be a string or a buffer')
    // Checksum
    let checksum = cryptools.sha256d(Buffer.concat(arr)).slice(0, 4)
    arr.push(checksum)
    return base58.encode(Buffer.concat(arr))
  }
}

module.exports = WalletAddress
