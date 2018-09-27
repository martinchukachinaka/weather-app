var gulp = require('gulp');

gulp.task('default', function (callback) {
    var path = require('path');
    var swPrecache = require('sw-precache');

    swPrecache.write('./sw.js', {
        staticFileGlobs: [
            './{scripts,styles,images}/**/*.{js,html,css,png,jpg,gif}',
            './favion.ico',
            './index.html'
        ],
        stripPrefix: '.',
        runtimeCaching: [{
            urlPattern: /^https:\/\/publicdata\-weather\.firebaseio\.com\//,
            handler: 'cacheFirst',
            options: {
                debug: true,
                cache: {
                    name: 'weatherapp-app-data-v3'
                }
            }
        }]
    }, callback);
});