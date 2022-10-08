require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Configuracion Basica
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));


const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });


let urlSchema = new mongoose.Schema({
  original : {type: String, required : true},
  short: {type : Number}
})

let Url = mongoose.model('Url', urlSchema)

let bodyParser = require('body-parser')
let objetoRespuesta = {}

app.post('/api/shorturl/', bodyParser.urlencoded({ extended: false }) , (req, res) => {
  let entradaUrl = req.body['url']
  
  let urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi)
  
  if(!entradaUrl.match(urlRegex)){
    res.json({error: 'Invalid URL'})
    return
  }
    
  objetoRespuesta['original_url'] = entradaUrl
  
  let inputShort = 1
  
  Url.findOne({})
        .sort({short: 'desc'})
        .exec((error, result) => {
          if(!error && result != undefined){
            inputShort = result.short + 1
          }
          if(!error){
            Url.findOneAndUpdate(
              {original: entradaUrl},
              {original: entradaUrl, short: inputShort},
              {new: true, upsert: true },
              (error, savedUrl)=> {
                if(!error){
                  objetoRespuesta['short_url'] = savedUrl.short
                  res.json(objetoRespuesta)
                }
              }
            )
          }
  })
  
})

app.get('/api/shorturl/:input', (req, res) => {
  let entrada = req.params.input
  
  Url.findOne({short: entrada}, (error, result) => {
    if(!error && result != undefined){
      res.redirect(result.original)
    }else{
      res.json('URL not Found')
    }
  })
})


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
const mySecret = process.env['DB_URI']
