var Promise = require('bluebird');

module.exports = {
    isLunch: function (post, context) {
        if (!post.message) {
            return false;
        }

        return post.message.toLowerCase().includes('lunch') ||
               post.message.toLowerCase().includes('obiad');
    },

    startOfWeek: function(post, context) {
        var day = context.date.getDay(),
        diff = context.date.getDate() - day + (day == 0 ? -6 : 1);

        var comparison = new Date(context.date.setDate(diff));
        var base = new Date(post.created_time);

        return comparison.toDateString() === base.toDateString();
    },

    sameDay: function(post, context) {
        var base = new Date(post.created_time);
        var comparison = context.date;

        return comparison.toDateString() === base.toDateString();
    }
}
