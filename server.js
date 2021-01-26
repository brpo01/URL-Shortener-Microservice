require('dotenv').config();
let express = require('express');
let mongoose = require('mongoose')
let cors = require('cors');
let app = express();
let bodyParser = require('body-parser')
let urlModel = require('./model.js')


// Basic Configuration
let port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));//Serve static files

let uri = 'mongodb+srv://rotimi:' + process.env.DB_PASSWORD + '@cluster0.jgeho.mongodb.net/urlShortner?retryWrites=true&w=majority'

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


let responseObject = {}

//post a 'url' to the req.body to get a json obj containg the url & the short field
app.post('/api/shorturl/new', bodyParser.urlencoded({ extended: false }) , (request, response) => {
  let inputUrl = request.body['url']
  
  let urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi); //regex for verifying urls

  if(!inputUrl.match(urlRegex)){
    response.json({error: 'Invalid URL'})
	  return
  }  
  responseObject['original_url'] = inputUrl
  
  let inputShort = 1
  
  urlModel.findOne({})
    .sort({short: 'desc'})
    .exec((error, result) => {
      if(!error && result != undefined){
        inputShort = result.short + 1
      }
      if(!error){
        urlModel.findOneAndUpdate(
        {original: inputUrl},
        {original: inputUrl, short: inputShort},
        {new: true, upsert: true },
        (error, savedUrl)=> {
          if(!error){
            responseObject['short_url'] = savedUrl.short
            response.json(responseObject)
          }
        }
      )
    }
  })
})


//get redirected the url(website) by the short field as a parameter in the url string
app.get('/api/shorturl/:input', (request, response) => {
  let input = request.params.input
  
  urlModel.findOne({short: input}, (error, result) => {
    if(!error && result != undefined){
      response.redirect(result.original)
    }else{
      response.json('URL not Found')
    }
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});




