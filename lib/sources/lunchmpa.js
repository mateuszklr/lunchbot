'use strict';

const request = require('request-promise');

var LunchmpaSource = function Constructor(emoji, name, restaurantId) {
    this.emoji = emoji;
    this.name = name;
    this.restaurantId = restaurantId;
    this.href = 'https://lunchmapa.pl/#/restaurant/' + restaurantId;

    this._lastFetch = null;
    this._fetchPromise = null;
};

LunchmpaSource.prototype.isCacheValid = function() {
    return this._fetchPromise !== null && this._lastFetch !== null && new Date() - this._lastFetch < 60000;
};

LunchmpaSource.prototype.fetchOffers = function(restaurantId) {
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
};

LunchmpaSource.prototype.getOffers = function(restaurantId) {
    if (!this.isCacheValid()) {
        this._lastFetch = new Date();
        this._fetchPromise = this.fetchOffers(restaurantId);
    }
    return this._fetchPromise;
};


LunchmpaSource.prototype.fetchForRestaurant = function(restaurantId) {
    return this.getOffers(restaurantId)
        .then(res => res.offer.lunches.today
            .map(lunch => lunch.description)
            .join('\n\n')
        )
        .then(o => [o + ' - _<https://lunchmapa.pl/#/restaurant/' + restaurantId + '|Source>_'])
        .catch(err => {
            console.warn('luncher fetch failed with:', err);
            return [];
        });
};

LunchmpaSource.prototype.fetch = function() {
    return this.fetchForRestaurant(this.restaurantId);
};

module.exports = LunchmpaSource;