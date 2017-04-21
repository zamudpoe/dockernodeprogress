'use strict';

const express  = require('express'); 
const app      = express(); 
let bodyParser = require('body-parser');   /*  */
let ejs        = require('ejs');           /* plantillas ejs, parecido a pug */ 
let pg         = require('pg');            /* postgress */

/*
  Con el comando 
    docker network inspect bridge 
  obtenemos el gateway para que se conecte nuestros contenedores node-app y node-db  
 
  "Gateway": "172.17.0.1" 
*/ 
let client = new pg.Client('postgres://postgres@172.17.0.1:9000/postgres');

let votes = {
  sandwiches : 0,
  tacos      : 0,
  otros      : 0
}; 

client.connect( function(err) { 
  if (err) throw err;

  /* Ejecutamos un query en nuestra base de datos. */
  client.query("SELECT * FROM votes", function (err, result) {
    /*if (err) console.log(err);*/
    if (err) throw err;

    /* Actualizamos nuestro objeto votes con el resultado de la base de datos */
    votes.sandwiches = result.rows[0].number_of_votes;
    votes.tacos      = result.rows[1].number_of_votes;
    votes.otros      = result.rows[2].number_of_votes;
 
    console.log("\n\tTacos: " + votes.tacos + "\n\tSandwiches: " + votes.sandwiches + "\n\tOtros: " + votes.otros);
  }); 
  
  // disconnect the client 
  /*client.end( function (err) {
   if (err) throw err;
  });
 */
});

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

/* Funcionalidad para manejo de votaciones con persitencia solo en MEMORIA RAM */
/* app.post("/vote", urlencodedParser, function(req, res){
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
   // nos aseguramos de redirigir a la ruta por default 
  res.redirect('/');
}); */

/* Funcionalidad para manejo de votaciones con persitencia en POSTGRES DB */
app.post('/vote', urlencodedParser, function(req, res) {
  let vote = req.body.yourVote;

  if(vote === 'sandwiches') {
    votes.sandwiches = votes.sandwiches + 1;
      client.query('UPDATE votes SET number_of_votes=\'' + votes.sandwiches + '\' WHERE option_name=\'sandwiches\'', function (err, result) {
        if (err) throw err;
      });
  } else if(vote === 'tacos') {
    votes.tacos = votes.tacos + 1;
      client.query('UPDATE votes SET number_of_votes=\'' + votes.tacos + '\' WHERE option_name=\'tacos\'', function (err, result) {
        if (err) throw err;
      });
  }  else if(vote === 'otros') {
    votes.otros = votes.otros + 1;
      client.query('UPDATE votes SET number_of_votes=\'' + votes.otros + '\' WHERE option_name=\'otros\'', function (err, result) {
        if (err) throw err;
      });
  } else {
    console.log('Something went wrong: vote contains ' + vote);
  }
  res.redirect('/');
});

const PORT = 8888;
app.listen(PORT);
console.log('Running on http://localhost: ' + PORT);

