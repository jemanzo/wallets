const crypto = require('crypto')

class CrypTools {
  sha256 (data, encode) {
    if (Array.isArray(data)) {
      let hashes = []
      for (let i = 0; i < data.length; i++) {
        hashes.push(CrypTools.prototype.sha256(data[i]))
      }
      return hashes
    }
    return crypto.createHash('sha256').update(data, encode).digest()
  }
  sha256d (data, encode) {
    if (Array.isArray(data)) {
      let hashes = []
      for (let i = 0; i < data.length; i++) {
        hashes.push(CrypTools.prototype.sha256d(data[i]))
      }
      return hashes
    }
    data = crypto.createHash('sha256').update(data, encode).digest()
    return crypto.createHash('sha256').update(data).digest()
  }
  sha256Pair (hash1, hash2, encode) {
    return this.sha256(Buffer.concat([hash1, hash2]))
  }
  sha256dPair (hash1, hash2, encode) {
    return this.sha256d(Buffer.concat([hash1, hash2]))
  }
  compactUInt (value) {
    // Math.pow(2,32) === 4294967296
    if (Buffer.isBuffer(value)) {
      switch (value[0]) {
        case 0xfd: return value.readUInt16LE(1)
        case 0xfe: return value.readUInt32LE(1)
        case 0xff: return (value.readUInt32LE(5) * 4294967296) + value.readUInt32LE(1)
        default: return value.readUInt8()
      }
    } else if (Number.isInteger(value)) {
      if (value >= 0 && value <= 252) {
        let buff = Buffer.alloc(1)
        buff.writeUInt8(value)
        return buff
      } else if (value > 252 && value <= 0xffff) {
        let buff = Buffer.alloc(3)
        buff[0] = 0xfd
        buff.writeUInt16LE(value, 1)
        return buff
      } else if (value > 0xffff && value <= 0xffffffff) {
        let buff = Buffer.alloc(5)
        buff[0] = 0xfe
        buff.writeUInt32LE(value, 1)
        return buff
      } else if (value > 0xffffffff && value <= 0xfffffffffffff) {
        let buff = Buffer.alloc(9)
        buff[0] = 0xff
        buff.writeUInt32LE(value % 4294967296, 1)
        buff.writeUInt32LE(Math.floor(value / 4294967296), 5)
        return buff
      } else {
        throw new Error('compactUInt: value out of range')
        // values between 0xfffffffffffff
        //            and 0xffffffffffffffff are expected to be accepted
        //            but we are not accepting here to avoid javascript
        //            rounding issues (loose precision)
        // workaround => deal with BigNumber when this error occurs
        //  try { let n = compactUInt(value) } catch(e) { let n = compactUIntBigNumber(value) }
      }
    }
    throw new TypeError('compactUInt: value must be a buffer or an integer')
  }
  compactUIntLength (value) {
    if (Buffer.isBuffer(value)) {
      switch (value[0]) {
        case 0xfd: return 3
        case 0xfe: return 5
        case 0xff: return 9
        default: return 1
      }
    } else if (Number.isInteger(value)) {
      if (value >= 0 && value <= 252) { return 1 }
      if (value > 252 && value <= 0xffff) { return 3 }
      if (value > 0xffff && value <= 0xffffffff) { return 5 }
      if (value > 0xffffffff && value <= 0xffffffffffffffff) { return 9 }
    }
  }
  targetHex (nbits) {
    // target => 32 bytes = 256 bits = 64 hex digits
    // nbits  => compacted target into 4 bytes
    // target =>  (32 - nbits[0]) zeros + nbits[1-3] + (32 - nbits[0] - 3) zeros
    // example:
    //   for nbits = '1d00ffff' (BTC Genesis Target - Diff 1)
    //       nbits[0] == hex 1d == dec 29 significant bytes
    //       target = '00 00 00' (32 - 29 = 3 zero bytes)
    //                '00 FF FF' (the 3 remaining bytes of nbits[1-3])
    //                '00 00 ..' (29 - 3 nbits significant bytes = 26 zeros)
    //       000000 + 00ffff + 0000000000000000000000000000000000000000000000000000
    if (Buffer.isBuffer(nbits)) {
      const buff = Buffer.from(nbits)
      buff.reverse()
      return '00'.repeat(32 - buff[0]) + buff.hexSlice(1, 4) + '00'.repeat(32 - (32 - buff[0]) - 3)
    }
    if (typeof nbits === 'string') {
      let exp = Number('0x' + nbits.substr(0, 2))
      return '00'.repeat(32 - exp) + nbits.substr(2, 6) + '00'.repeat(32 - (32 - exp) - 3)
    }
    return ''
  }
}

module.exports = new CrypTools()
