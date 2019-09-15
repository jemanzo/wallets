const crypto = require('crypto')

const MIN_PRIVATE_KEY = Buffer.from('0000000000000000000000000000000000000000000000000000000000000001', 'hex')
const MAX_PRIVATE_KEY = Buffer.from('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140', 'hex')

class WalletKey {
  constructor () {
    this.version = -1
    this.flag = -1
    this.data = null
    this.hash = null
    this.checksum = null
  }
  isCompressed () {
    // The uncompressed pubkey a total of 65 bytes where:
    //   slice(0,1)   => first byte is 0x04 (meaning it is uncompressed)
    //   slice(1,33)  => pubkey part 1, representing a 32 bytes big number known as "X"
    //   slice(33,65) => pubkey part 2, representing a 32 bytes big number known as "Y"
    //
    // When pubkey is compressed, 33 bytes, we have only the first part of it, called "X",
    // starting with a single byte flag representing whether "Y" exists, parity, as shown:
    //   slice(0,1)  => 0x02 (compressed -> Y is even)
    //   slice(0,1)  => 0x03 (compressed -> Y is odd)
    //   slice(1,33) => pubkey part 1, called "X" ("Y" is omited)
    //
    if (Buffer.isBuffer(this.data)) {
      if (this.data[0] === 0x02 || this.data[0] === 0x03) { return true }
    }
    return false
  }
  static createPrivateKey () {
    var privkey
    do {
      privkey = crypto.randomBytes(32)
    } while (!WalletKey.validatePrivateKey(privkey))
    return privkey
  }
  static validatePrivateKey (privkey) {
    var isValid = true
    if (privkey.compare(MIN_PRIVATE_KEY) < 0) { isValid = false }
    if (privkey.compare(MAX_PRIVATE_KEY) > 0) { isValid = false }
    return isValid
  }
}

module.exports = WalletKey
