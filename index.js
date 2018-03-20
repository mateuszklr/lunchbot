// index.js

var LunchBot = require('./lib/lunchbot');
var FacebookSource = require('./lib/sources/facebook');
var luncherSource = require('./lib/sources/luncher');
var Parsers = require('./lib/parsers');
var Filters = require('./lib/filters');

var config = require('config');
var Promise = require('bluebird');

var token = config.get('slack.api');
var name = config.get('slack.name');

process.on('uncaughtException', function(err) {
    console.log(err);
});

process.on('exit', function() {
    console.log('Process exiting');
});

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

const services = [sexyduck, pelnapara, lasirena, orzo, bierhalle];

console.log('Starting LunchBot with ' + services.length + ' services');

bot.services = services;
bot.run();
