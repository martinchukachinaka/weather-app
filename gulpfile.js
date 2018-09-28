var gulp = require('gulp');

gulp.task('default', function (callback) {
    // var path = require('path');
    // var rootDir = '';
    var swPrecache = require('sw-precache');

    swPrecache.write('sw.js', {
        staticFileGlobs: [
            `styles/ud811.css`,
            `scripts/idb.js`,
            `scripts/store.js`
        ],
        // stripPrefix: rootDir,
        runtimeCaching: [{
            urlPattern: /^https:\/\/publicdata\-weather\.firebaseio\.com\//,
            handler: 'cacheFirst',
            options: {
                debug: true,
                cache: {
                    name: 'weatherapp-app-data-v4.3'
                }
            }
        }]
    }, callback);
});