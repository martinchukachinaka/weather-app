var gulp = require('gulp');

gulp.task('default', function (callback) {
    // var path = require('path');
    // var rootDir = '';
    var swPrecache = require('sw-precache');

    swPrecache.write('sw.js', {
        staticFileGlobs: [
            '{styles,scripts,images}/**/*.{js,html,css,png,jpg,gif}',
            'index.html'
            // `styles/ud811.css`,
            // `scripts/idb.js`,
            // `scripts/store.js`
        ],
        // stripPrefix: rootDir,
        runtimeCaching: [{
            urlPattern: /^https:\/\/publicdata\-weather\.firebaseio\.com\//,
            handler: 'cacheFirst',
            options: {
                debug: true,
                cache: {
                    name: 'weatherapp-app-data-v5'
                }
            }
        }]
    }, callback);
});