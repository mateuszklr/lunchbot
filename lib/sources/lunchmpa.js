'use strict';

const Promise = require('bluebird');
const request = require('request-promise');

let _lastFetch = null;
let _fetchPromise = null;

function isCacheValid() {
    return _fetchPromise !== null && _lastFetch !== null && new Date() - _lastFetch < 60000;
}

function fetchOffers(restaurantId) {
    return request.get({
        url: 'https://lunchmapa.pl/api/restaurants/profile/' + restaurantId,
        headers: {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
            'pragma': 'no-cache',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'pl,en-US;q=0.9,en;q=0.8',
            'accept': 'application/json, text/plain, */*',
            'cache-control': 'no-cache',
            'authority': 'lunchmapa.pl',
            'referer': 'https://lunchmapa.pl/'
        },
        json: true
    });
}

function getOffers(restaurantId) {
    if (!isCacheValid()) {
        _lastFetch = new Date();
        _fetchPromise = fetchOffers(restaurantId);
    }
    return _fetchPromise;
}


function fetchForRestaurant(restaurantId) {
    return getOffers(restaurantId)
        .then(res => res.offer.lunches.today
            .map(lunch => lunch.description)
            .join('\n\n')
        )
        .then(o => [o + ' - _<https://lunchmapa.pl/#/restaurant/' + restaurantId + '|Source>_'])
        .catch(err => {
            console.warn('luncher fetch failed with:', err);
            return [];
        });
}

module.exports = function(emoji, name, restaurantId) {
    return {
        href: 'https://lunchmapa.pl/#/restaurant/' + restaurantId,
        emoji: emoji,
        name: name,
        fetch: () => fetchForRestaurant(restaurantId)
    }
}

