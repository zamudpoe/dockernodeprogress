'use strict';

const express  = require('express'); 
const app      = express(); 

let bodyParser = require('body-parser'); 
let ejs        = require('ejs'); 
let pg         = require('pg'); 

let votes = {
  sandwiches : 0,
  tacos      : 0,
  otros      : 0
};

let urlencodedParser = bodyParser.urlencoded({ extended: false })

/* establecemos engine para manejo de plantillas y sera el modulo ejs */
app.set('view engine', 'ejs');
/* directorio de trabajo : /views */
app.set('views', __dirname + '/views')

/* Ruta por defaul / */
app.get('/', function (req, res) {
  res.render('pages/index', {
    votes: votes
  });
});

/* Funcionalidad para manejo de votaciones */
app.post("/vote", urlencodedParser, function(req, res){
  let vote = req.body.yourVote;
  if (vote === 'sandwiches') {
    votes.sandwiches = votes.sandwiches + 1;
    console.log("votaste por Sandwiches: " + votes.sandwiches);
  } else if (vote === 'tacos' ) {
    votes.tacos = votes.tacos + 1;
    console.log("votaste por tacos: " + votes.tacos);
  } else if(vote === 'otros') { 
    votes.otros = votes.otros + 1;
    console.log( 'votaste por otros: ' + votes.otros );
  } else {
    console.log( 'Algo salio mal: ' + vote );
  }
  /* nos aseguramos de redirigir a la ruta por default */
  res.redirect('/');
}); 

const PORT = 8888;
app.listen(PORT);
console.log('Running on http://localhost: ' + PORT);

