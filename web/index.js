const express = require('express');
const app = express();
const Cryptor = require('../AES/Cryptor');                           
const multer = require("multer");
const hbs = require('hbs');
const path = require("path");
const fs = require("fs");

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.set('view engine', 'hbs');
app.use(express.static(__dirname + "/data"));

app.get('/encrypt', (req, res) => {
    res.render( __dirname + "/views/encrypt.hbs");
})
app.get('/decrypt', (req, res) => {
  res.render( __dirname + "/views/decrypt.hbs");
})
let diskStorage = multer.diskStorage({
    destination: (req, file, callback) => {
      // Định nghĩa nơi file upload sẽ được lưu lại
      callback(null, "./web/data");
    },
    filename: (req, file, callback) => {

      let math = ["image/png", "image/jpeg", "text/plain"];
      if (math.indexOf(file.mimetype) === -1) {
        let errorMess = `The file <strong>${file.originalname}</strong> is invalid. Only allowed to upload image jpeg or png.`;
        return callback(errorMess, null);
      }
      let filename = `${file.originalname}`;
      callback(null, filename);
    }
});
let uploadFile = multer({storage: diskStorage}).single("file");

app.post('/encrypt', (req, res) => {
    uploadFile(req, res, (error) => {
        const { key, bits } = req.body;
        console.log(req.file);
        if (error) {
          return res.send(`Error when trying to upload: ${error}`);
        }
        const filePath = path.join(`${__dirname}/data/${req.file.filename}`);
        const op = "encrypt";
        const crypt = new Cryptor({ filePath, password: key, bits, op });
        crypt.encrypt();
        res.json({
            code:200,
            message:"success",
            outputPath: `./${req.file.filename}.encrypted`
        });
    });
});
app.post('/decrypt', (req, res) => {
  uploadFile(req, res, (error) => {
      const { key, bits } = req.body;
      if (error) {
        return res.send(`Error when trying to upload: ${error}`);
      }
      const filePath = path.join(`${__dirname}/data/${req.body.file}`);
      const filename = path.parse(req.body.file).name;
      const outputFilePath = path.join(`${__dirname}/data/decrypted/${filename}`);
      const crypt = new Cryptor({ filePath, outputFilePath, password: key, bits });
      crypt.decrypt();
      res.json({
          code:200,
          message:"success",
          outputPath: `./decrypted/${filename}`
      });
  });

})
app.get('/files', (req, res) => {
  const files = fs.readdirSync(__dirname + "/data").filter(e => {
    if(path.extname(e) === ".encrypted")
      return true;
  });
  res.send({
    code:200,
    files
  })
})
app.listen(3000, () => {
   
})