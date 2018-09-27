(function () {
  'use strict';

  var injectedForecast = {
    key: 'newyork',
    label: 'New York, NY',
    currently: {
      time: 1453489481,
      summary: 'Clear',
      icon: 'partly-cloudy-day',
      temperature: 52.74,
      apparentTemperature: 74.34,
      precipProbability: 0.2,
      humidity: 0.77,
      windBearing: 125,
      windSpeed: 1.52
    },
    daily: {
      data: [
        { icon: 'clear-day', temperatureMax: 55, temperatureMin: 34 },
        { icon: 'rain', temperatureMax: 55, temperatureMin: 34 },
        { icon: 'snow', temperatureMax: 55, temperatureMin: 34 },
        { icon: 'sleet', temperatureMax: 55, temperatureMin: 34 },
        { icon: 'fog', temperatureMax: 55, temperatureMin: 34 },
        { icon: 'wind', temperatureMax: 55, temperatureMin: 34 },
        { icon: 'partly-cloudy-day', temperatureMax: 55, temperatureMin: 34 }
      ]
    }
  };

  var weatherAPIUrlBase = 'https://publicdata-weather.firebaseio.com/';

  var app = {
    isLoading: true,
    visibleCards: {},
    selectedCities: [],
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container'),
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };

  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/

  /* Event listener for refresh button */
  document.getElementById('butRefresh').addEventListener('click', function () {
    app.updateForecasts();
  });

  /* Event listener for add new city button */
  document.getElementById('butAdd').addEventListener('click', function () {
    // Open/show the add new city dialog
    app.toggleAddDialog(true);
  });

  /* Event listener for add city button in add city dialog */
  document.getElementById('butAddCity').addEventListener('click', function () {
    var select = document.getElementById('selectCityToAdd');
    var selected = select.options[select.selectedIndex];
    var key = selected.value;
    var label = selected.textContent;
    app.getForecast(key, label);
    const obj = { key: key, label: label };
    app.selectedCities.push(obj);
    store.storeItem(WEATHER_STORE, obj, obj.key);
    app.toggleAddDialog(false);
  });

  /* Event listener for cancel button in add city dialog */
  document.getElementById('butAddCancel').addEventListener('click', function () {
    app.toggleAddDialog(false);
  });

  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  // Toggles the visibility of the add new city dialog.
  app.toggleAddDialog = function (visible) {
    if (visible) {
      app.addDialog.classList.add('dialog-container--visible');
    } else {
      app.addDialog.classList.remove('dialog-container--visible');
    }
  };

  // Updates a weather card with the latest weather forecast. If the card
  // doesn't already exist, it's cloned from the template.
  app.updateForecastCard = function (data) {
    var card = app.visibleCards[data.key];
    if (!card) {
      card = app.cardTemplate.cloneNode(true);
      card.classList.remove('cardTemplate');
      card.querySelector('.location').textContent = data.label;
      card.removeAttribute('hidden');
      app.container.appendChild(card);
      app.visibleCards[data.key] = card;
    }
    card.querySelector('.description').textContent = data.currently.summary;
    card.querySelector('.date').textContent = new Date(
      data.currently.time * 1000
    );
    card.querySelector('.current .icon').classList.add(data.currently.icon);
    card.querySelector('.current .temperature .value').textContent = Math.round(
      data.currently.temperature
    );
    card.querySelector('.current .feels-like .value').textContent = Math.round(
      data.currently.apparentTemperature
    );
    card.querySelector('.current .precip').textContent =
      Math.round(data.currently.precipProbability * 100) + '%';
    card.querySelector('.current .humidity').textContent =
      Math.round(data.currently.humidity * 100) + '%';
    card.querySelector('.current .wind .value').textContent = Math.round(
      data.currently.windSpeed
    );
    card.querySelector('.current .wind .direction').textContent =
      data.currently.windBearing;
    var nextDays = card.querySelectorAll('.future .oneday');
    var today = new Date();
    today = today.getDay();
    for (var i = 0; i < 7; i++) {
      var nextDay = nextDays[i];
      var daily = data.daily.data[i];
      if (daily && nextDay) {
        nextDay.querySelector('.date').textContent =
          app.daysOfWeek[(i + today) % 7];
        nextDay.querySelector('.icon').classList.add(daily.icon);
        nextDay.querySelector('.temp-high .value').textContent = Math.round(
          daily.temperatureMax
        );
        nextDay.querySelector('.temp-low .value').textContent = Math.round(
          daily.temperatureMin
        );
      }
    }
    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }
  };

  /*****************************************************************************
   *
   * Methods for dealing with the model
   *
   ****************************************************************************/

  // Gets a forecast for a specific city and update the card with the data
  app.getForecast = function (key, label) {
    var url = weatherAPIUrlBase + key + '.json';
    var dataLoaded = false;
    console.log('In get forecast. url: ', url);
    if ('caches' in window) {
      caches.keys().then(keys => console.log('caches found keys - ', keys));
      caches.match(url).then(response => {
        console.log('Got URL in cache in app: ', url);
        if (response) {
          // console.log('response found: ', response);
          response.json().then(cachedResponse => {
            if (!dataLoaded) {
              console.log('[CACHE] Using cached result');
              dataLoaded = true;
              cachedResponse.key = key;
              cachedResponse.label = label;
              app.updateForecastCard(cachedResponse);
            }
          });
        }
      });
    }
    fetch(url)
      .then(res => res.json())
      .then(response => {
        if (!dataLoaded) {
          console.log('[NO-CACHE] Using network result');
          dataLoaded = true;
          response.key = key;
          response.label = label;
          app.updateForecastCard(response);
        }
      })
  };

  // Iterate all of the cards and attempt to get the latest forecast data
  app.updateForecasts = function () {
    var keys = Object.keys(app.visibleCards);
    keys.forEach(function (key) {
      app.getForecast(key);
    });
  };

  document.addEventListener('DOMContentLoaded', function (event) {
    store.list(WEATHER_STORE).then(
      cities => {
        console.log('cities found: ', cities);
        if (cities.length > 0) {
          console.log('reading from store...');
          cities.forEach(city => {
            app.getForecast(city.key, city.label);
          });
        } else {
          store.storeItem(
            WEATHER_STORE,
            {
              key: injectedForecast.key,
              label: injectedForecast.label
            },
            injectedForecast.key
          );
          app.updateForecastCard(injectedForecast);
        }
      },
      error => {
        console.error(error);
        console.error('not found: Error: ', error);
        app.updateForecastCard(injectedForecast);
      }
    );
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function (event) {
      navigator.serviceWorker
        .register('/sw.js')
        // .register('/service-worker.js')
        .catch(err =>
          console.error('ServiceWorker registration failed: ', err)
        );
    });
  }
})();
