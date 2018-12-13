var Tokenizer = require('sentence-tokenizer');
var Promise = require('bluebird');

var tokenizer = new Tokenizer('Chuck');
var priceRegex = /((?:€\d+(?:(?:\.|,)\d{1,2})?)|(?:\b\d+(?:\.|,)\d{2}\b)|(?:\d+(?:(?:\.|,)\d{1,2})?€))/g;

module.exports = {
    basicPrice: function(post) {
        if (!post.message) {
            return new Promise.reject();
        }

        // Split into lines (as people don't properly finish their sentences...)
        var lines = post.message.split('\n');
        var messages = [];

        if (lines.length == 0) {
            return new Promise.reject();
        }

        for (line of lines) {
            if (line.length == 0) {
                continue;
            }

            tokenizer.setEntry(line);

            var sentences = [];

            try {
                sentences = tokenizer.getSentences().filter(function(e) {
                    return e.length != 0 && e.match(priceRegex);
                }).map(function(e) {
                    return e[0].toUpperCase() + e.substr(1);
                });
            } catch (err) {
                // Ignore
            }

            if (sentences.length > 0) {
                messages.push(tokenizer.getSentences().join(' '));
            }
        }

        if (messages.length === 0) {
            return new Promise.reject();
        }

        var result = messages.join('. ');
        if (result.length > 0) {
            result += ' - _<https://facebook.com/' + post.id + '|Source>_';
            return new Promise.resolve(result);
        }

        return new Promise.reject();
    },

    daily: function(post) {
        if (!post.message) {
            return new Promise.reject();
        }

        if (!post.message.toLowerCase().containsAny(['lunch', 'zupa'])) {
            return new Promise.reject();
        }

        // Split into lines (as people don't properly finish their sentences...)
        var lines = post.message.split('\n');
        var messages = [];

        if (lines.length == 0) {
            return new Promise.reject();
        }

        for (line of lines) {
            if (line.length == 0) {
                continue;
            }
            messages.push(line);
        }

        if (messages.length === 0) {
            return new Promise.reject();
        }

        var result = messages.join('\n');
        if (result.length > 0) {
            return this.fetchPostPhotos(post).then(function(photo) {
                return new Promise.resolve({
                   text: result += ' - _<https://facebook.com/' + post.id + '|Source>_',
                   image: photo
               });
            });
            
            // return new Promise.resolve(result);
        }

        return new Promise.reject();
    },

    weeklyMenu: function(post, context) {
        if (!post.message) {
            return new Promise.reject();
        }

        var day = context.date.getDay();
        if (day < 1 || day > 5) {
            return new Promise.reject();
        }

        const lowerCaseMessage = post.message.toLowerCase();
        
        const daysSimple = ["poniedziałek", "wtorek", "środa", "czwartek", "piątek"];
        const days = [
            "poniedziałek\\s*\\n|naponiedzialek\\s*\\n", 
            "wtorek\\s*\\n|nawtorek\\s*\\n",
            "środa\\s*\\n|nasrode\\s*\\n",
            "czwartek\\s*\\n|naczwartek\\s*\\n",
            "piątek\\s*\\n|napiatek\\s*\\n"];
        var currentDay = days[day - 1];
        var nextDay = day < 5 ? days[day] : undefined;

        let currentDayIdx = lowerCaseMessage.search(currentDay);


        // Look for textual posts
        if (lowerCaseMessage.containsAny(daysSimple) && currentDayIdx != -1) {
            let nextDayIdx = nextDay ? lowerCaseMessage.search(nextDay) : undefined;

            let menu = post.message.substring(currentDayIdx, nextDayIdx);
            return new Promise.resolve(menu + ' - _<https://facebook.com/' + post.id + '|Source>_');
        }

        // Didn't find any, try to find image based ones (that still contain some keywords in the textual part)
        const keywords = ["lunch"];
        if (lowerCaseMessage.containsAny(keywords)) {
            // Grab additional details
            return this.fetchPostPhotos(post).then(function(photo) {
                return new Promise.resolve({
                    text: post.message + ' - _<https://facebook.com/' + post.id + '|Source>_',
                    image: photo
                });
            });
        }

        return new Promise.reject();
    }
}
