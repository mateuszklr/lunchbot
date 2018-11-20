// index.js

var LunchBot = require('./lib/lunchbot');
var FacebookSource = require('./lib/sources/facebook');
var luncherSource = require('./lib/sources/luncher');
var LunchmpaSource = require('./lib/sources/lunchmpa');
var Parsers = require('./lib/parsers');
var Filters = require('./lib/filters');

var config = require('config');
var Promise = require('bluebird');
var http = require('http');

var token = config.get('slack.api');
var name = config.get('slack.name');

process.on('uncaughtException', function(err) {
    console.log(err);
});

process.on('exit', function() {
    console.log('Process exiting');
});

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('lunchbot is OK!\n');
}).listen(process.env.PORT || 8080);

var bot = new LunchBot({
    token: token,
    name: name,
    usesReactionVoting: config.get('slack.usesReactionVoting')
});

var daily = {
    chains: [
        {
            parser: Parsers.daily,
            filter: Filters.sameDay
        }
    ]
};

var weekly = {
    chains: [
        {
            parser: Parsers.weeklyMenu,
            filter: Filters.isLunch
        }
    ]
};

//
//  Sources
//

// Sexy Duck
const sexyduck = new FacebookSource('duck', 'Sexy Duck', "sexyduckvarsavia", weekly);

// Pelna Para
const pelnapara = new FacebookSource('bamboo', 'Pełną Parą', "pelnaparananowo", weekly);

// La Sirena
const lasirena = new FacebookSource('taco', 'La Sirena', "873793949400701", daily);

// Orzo
const orzo = new FacebookSource('leaves', 'Orzo', "orzopeoplemusicnature", weekly);

// Bierhalle
const bierhalle = new FacebookSource('beer', 'Bierhalle', "BierhalleKoszyki", daily);

// Sofra
const sofra = new FacebookSource('rabbit', 'Sofra', "sofra.warszawa", daily);

// U Szwejka
const szwejk = new FacebookSource('poultry_leg', 'U Szwejka', "Szwejk", weekly);

// Na Bałkany
const nabalkany = new FacebookSource('sunrise_over_mountains', 'Na Bałkany', "nabalkany", weekly);

const sloik = new LunchmpaSource('jar', 'Słoik', 'restauracja_sloik');

const totopho = new LunchmpaSource('ramen', 'To To Pho', 'to_to_pho_widok');

const makaiwoda = new FacebookSource('spaghetti', 'Mąka i Woda', "MakaiWoda", daily);

const latomatina = new FacebookSource('tomato', 'La Tomatina', "178498048891814", daily);

const services = [latomatina, sloik, totopho, makaiwoda];

console.log('Starting LunchBot with ' + services.length + ' services');

bot.services = services;
bot.run();
