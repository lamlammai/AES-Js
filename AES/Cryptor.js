const AesCtr = require('./aesCtr');
const fs = require('fs');
const Blob = require('node-blob');

class Cryptor {
  constructor ({filePath, outputFilePath, password, bits, op}) {
    this.filePath = filePath;
    this.op = (op && op.toString().toUpperCase() ) || '';
    this.encryptExt = '.encrypted';
    this.decryptExt = '.decrypted';
    this.outputFilePath = outputFilePath ? outputFilePath : op && op ==='encrypt' ? `${this.filePath}${this.encryptExt}`:  op && op ==='decrypt' ?  `${this.filePath}${this.decryptExt}`: `${filePath}${new Date().getTime()}`;
    this.password = password;
    this.bits = Number(bits);
    this.raw = fs.readFileSync(filePath);
  }

  async encrypt () {
    return new Promise((resolve, reject)=> {
      try {
        let base64String = Buffer.from(this.raw).toString("base64");
        const cipherText = AesCtr.encrypt(base64String, this.password, this.bits);
        const blobData = new Blob([cipherText], {type: 'text/plain'});

        fs.writeFileSync(this.outputFilePath, blobData.buffer);

        return resolve({...this})
      } catch(error) {
        return reject({error});
      }
    });

  }

  
  async decrypt () {
    return new Promise((resolve, reject)=> {
      try {
        const cipherText = fs.readFileSync(this.filePath);
        // console.log({cipherText});
        const base64String = AesCtr.decrypt(cipherText, this.password, this.bits);
        // console.log({base64String});

        const bufferFromBase64 = Buffer.from(base64String, "base64");
        // console.log({bufferFromBase64});

        fs.writeFileSync(this.outputFilePath, bufferFromBase64);
        return resolve({...this});
      } catch(error) {
        console.log(error);
        return reject({error});
      }
    });
  }

}

// const crypt1 = new Cryptor({
//   filePath: './1.png',
//   password: 'toanh',
//   bits: 128,
//   op: 'encrypt'
// })
// crypt1.encrypt();
// const crypt2 = new Cryptor({
//   filePath: './1.png.encrypted',
//   outputFilePath: './11.png',
//   password: 'toanh',
//   bits: 128,
// })
// crypt2.decrypt();

module.exports = Cryptor;
