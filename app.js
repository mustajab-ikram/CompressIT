const express           = require('express'),
      multer            = require('multer'),
      ejs               = require('ejs'),
      path              = require('path'),
      bodyparser        = require("body-parser"),
      fs                = require("fs"),
      zlib              = require("zlib"),
      admzip            = require("adm-zip");

// Setting Up Express
const app = express();

// EJS
app.set('view engine', 'ejs');

// Setting Up Public Folder and Images Folder
app.use(express.static('public'))

// Setting Up Disk Storage
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
});

// Init Upload constant
const upload = multer({
    storage     : storage
})

// Setting Up GET / (Index) Page
app.get('/', (req, res) => {
    res.render('index')
})
// Setting Up /compressfiles route
app.post('/',upload.array('files', 100), (req, res) => {
    const zip = new admzip();
    const outputFilePath = Date.now() + "output.zip";

    if(req.files){
        req.files.forEach(file => {
            console.log(file.path)
            zip.addLocalFile(file.path)
        });
    }

    fs.writeFileSync(outputFilePath, zip.toBuffer());
    res.download(outputFilePath,(err) => {
      if(err){
        req.files.forEach((file) => {
          fs.unlinkSync(file.path)
        });
        fs.unlinkSync(outputFilePath) 
      }

      req.files.forEach((file) => {
        fs.unlinkSync(file.path)
      });

      fs.unlinkSync(outputFilePath)
    })
} )

// Setting Up PORT
const PORT = 5000;

// Listening To PORT
app.listen(PORT, () => {
    console.log(`Server has started at PORT http://localhost:${PORT}/`)
})