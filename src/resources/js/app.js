/**
 * Service Worker registration
 */
function _registerServiceWorker() {
  if (!navigator.serviceWorker) return;

  navigator.serviceWorker.register('/sw.js')
  .then(reg => {
    if (!navigator.serviceWorker.controller) return;

    if (reg.waiting) {
      _showSnackBar('Get latest improvements');
      return _initSWUpdateBtn(reg.waiting);
    }

    if (reg.installing) {
      return _trackInstalling(reg.installing);
    }

    reg.addEventListener('updatefound', () => {
      _trackInstalling(reg.installing);
    });
  })
  .catch(err => {
    console.log(err);
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });

  navigator.serviceWorker.addEventListener('message', event => {
    /**
     * If Maps API was not available then there is no network connection, hence
     * hide the Maps container and make app usable for offline users.
     */
    if (event.data.message === 'mapsoffline') {
      _showOfflinePlaces();
    }
    /**
     * If IP data isn't available then get stored IP data and render it to the DOM
     */
    else if (event.data.message === 'ipoffline') {
      localforage.getItem('ip')
      .then(data => {
        const geo = data.apiData.data.city.geo;
        aqiCall(geo[0], geo[1], 'ip');
      })
      .catch(err => {
        console.log(err);
      });
    }
  })
}
_registerServiceWorker();

function _trackInstalling(worker) {
  worker.addEventListener('statechange', () => {
    if (worker.state === 'installed') {
      _showSnackBar('Get latest improvements');
      _initSWUpdateBtn(worker);
    }
  });
}

let map, initZoom, timeout;
let unionPoly;
let distances = [];

// Initializes the Google Maps
function initGMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 20, lng: 20 },
    zoom: 8,
    maxZoom: 14,
    mapTypeId: 'roadmap',
    mapTypeControl: false,
    streetViewControl: false,
    zoomControl: false,
    fullscreenControl: false,
    styles: [
      {
        "featureType": "poi.business",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "labels.text",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "road.arterial",
        "elementType": "labels",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "labels",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "road.local",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      }
    ]
  });

  // Runs at the start of the app
  google.maps.event.addListenerOnce(map, 'idle', () => {
    axios.get('https://ipinfo.io/?token=7eed22252c7672')
    .then(response => {
      const location = response.data.loc.split(',');
      map.setCenter(new google.maps.LatLng(location[0], location[1]))
      aqiCall(location[0], location[1], 'ip');
    })
    .catch(err => {
      console.log(err);
    })
  });

  // Create the search box and link it to the UI element.
  const input = document.getElementById('txtMapSearch');
  const searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('mapControls'));

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', () => {
    searchBox.setBounds(map.getBounds());
  });

  /**
   * Listen for the event fired when the user selects a prediction and retrieve
   * more details for that place.
   */
  searchBox.addListener('places_changed', () => {
    const places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // For each place, get the icon, name and location.
    const bounds = new google.maps.LatLngBounds();
    places.forEach(place => {
      if (!place.geometry) {
        return console.log("Returned place contains no geometry");
      }

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }

      /**
       * Fit the bounds of the map, zoom out of the map to get additional
       * centers and reset zoom after aqi data is received.
       */
      map.fitBounds(bounds);
      initZoom = map.getZoom();
      map.setZoom(initZoom - 3);
      aqiCall(place.geometry.location.lat(), place.geometry.location.lng()).then(() => {
        map.setZoom(initZoom);
      });
    });
  });

}

function _renderDOM(data) {

  if (data.status == 'nope' || data.status == 'error')
    return;

  const badgeMain = document.getElementById('badgeMain');
  const badgeMainOtherToday = document.getElementById('badgeMainOtherToday');
  const containerPollutants = document.getElementById('pollutantDetails');
  const contPollutantsToday = document.getElementById('pollutantDetailsToday');
  containerPollutants.innerHTML = '';
  contPollutantsToday.innerHTML = '';

  /*
  const badgeOzoneOtherToday = document.getElementById('badgeOzoneOtherToday');
  const badgePMOtherToday = document.getElementById('badgePMOtherToday');
  */

  const timeObserved = document.getElementById('timeObserved');
  const locObserved = document.getElementById('locObserved');
  const attribution = document.getElementById('attribution');
  const mainHealthMessage = document.getElementById('mainHealthMessage');
  const healthMessageOtherToday = document.getElementById('healthMessageOtherToday');

  badgeMain.classList = [];
  badgeMain.classList.add('badge');
  badgeMainOtherToday.classList = [];
  badgeMainOtherToday.classList.add('badge', 'small');

  data = data.data;
  const aqi = data.aqi;
  const time = new Date(data.time.v);
  const aqiTitle = _aqiStatus(aqi);

  /**
   * Add each pollutants level to the DOM
   */
  for (let poll in data.iaqi) {
    if (data.iaqi.hasOwnProperty(poll) && _getTitle(poll)) {
      const column = document.createElement('div');
      column.classList.add('column');

      const badge = document.createElement('div');
      badge.classList.add('badge', 'smallest', _aqiStatus(data.iaqi[poll].v));
      badge.innerText = Math.round(data.iaqi[poll].v*10)/10;

      if (data.dominentpol == poll)
        badge.classList.add('dominant');

      const title = document.createElement('div');
      title.classList.add('main-title');
      title.innerText = _getTitle(poll);

      column.appendChild(badge);
      column.appendChild(title);
      containerPollutants.appendChild(column);

      if (data.dominentpol == poll || contPollutantsToday.children.length == 0)
        contPollutantsToday.appendChild(column.cloneNode(true));
    }
  }

  badgeMain.innerText = aqi;
  badgeMainOtherToday.innerText = aqi;
  badgeMain.classList.add(aqiTitle);
  badgeMainOtherToday.classList.add(aqiTitle);

  if (aqi <= 50)
    mainHealthMessage.innerText = 'No Risk, enjoy your day';
  else if (aqi <= 100)
    mainHealthMessage.innerText = 'Small concern for people sensitive to air pollution';
  else if (aqi <=  150)
    mainHealthMessage.innerText = 'Children & Senior groups may experience health effects';
  else if (aqi <= 200)
    mainHealthMessage.innerText = 'Everyone may begin to experience health effects';
  else if (aqi <= 300)
    mainHealthMessage.innerText = 'Everyone may experience more serious health effects';
  else
    mainHealthMessage.innerText = 'Health warnings and emergency conditions';

  healthMessageOtherToday.innerText = mainHealthMessage.innerText;

  /*
  badgeOzone.innerText = o3;
  badgeOzoneOtherToday.innerText = o3;
  badgeOzone.classList.add(_aqiStatus(o3));
  badgeOzoneOtherToday.classList.add(_aqiStatus(o3));
  
  badgePM.innerText = pm;
  badgePMOtherToday.innerText = pm;
  badgePM.classList.add(_aqiStatus(pm));
  badgePMOtherToday.classList.add(_aqiStatus(pm));
  */

  timeObserved.innerText = time.getHours() + ':' + time.getMinutes();

  locObserved.innerText = Math.round(data.city.distance/1000)+'km - ' + data.city.name;

  attribution.innerText = data.attributions[0].name;
  attribution.href = data.attributions[0].url;

  /**
   * Update the legend data
   */
  const btnLegend = document.getElementById('expand-legend');
  const text = btnLegend.getElementsByTagName('div')[0];
  const aqiColor = _getStrokeColor(aqi);

  btnLegend.getElementsByTagName('span')[0].style.background = aqiColor;
  text.style.color = aqiColor;
  text.innerText = _aqiStatus(aqi, true);

}

/**
 * Returns the class name based on aqi level
 * This is used in css to render different colors for every aqi level
 */
function _aqiStatus(aqi, short) {
  if (aqi <= 50)
    return 'good';
  else if (aqi <= 100)
    return 'moderate';
  else if (aqi <=  150)
    return short ? 'USG' : 'unhealthy-moderate';
  else if (aqi <= 200)
    return 'unhealthy';
  else if (aqi <= 300)
    return short ? 'VU' : 'very-unhealthy';
  else
    return 'hazardous';
}

/**
 * Returns the hex color code based on the aqi level provided
 */
function _getStrokeColor(aqi) {
  if (aqi <= 50)
    return '#0ACD47';
  else if (aqi <= 100)
    return '#F5DB2A';
  else if (aqi <=  150)
    return '#F99846';
  else if (aqi <= 200)
    return '#F16A62';
  else if (aqi <= 300)
    return '#80518E';
  else
    return '#6B1C31';
}

/**
 * Gets the title of the pollutant based on short name
 */
function _getTitle(shortname) {
  if (shortname == 'co')
    return 'Carbon Monoxide';
  else if (shortname == 'h')
    return 'Hydrogen';
  else if (shortname == 'no2')
    return 'Nitrogen Oxide';
  else if (shortname == 'o3')
    return 'Ozone';
  else if (shortname == 'pm10')
    return 'PM (1.0)';
  else if (shortname == 'pm25')
    return 'PM (2.5)';
  else if (shortname == 'so2')
    return 'Sulphur Dioxide';
  else
    return null;
}


/**
 * Gets the data from the API based on latitude and longitude and renders the data
 * to the DOM
 */
async function aqiCall(lat, lng, placeName) {
  const coordsCurrent = new google.maps.LatLng(lat, lng);
  const txtMapSearch = document.getElementById('txtMapSearch');
  let apiData = {status: ''};
  placeName = placeName ? placeName : txtMapSearch.value;

  /**
   * Clear the old timeout
   */
  if (timeout) {
    clearTimeout(timeout);
    timeout = undefined;
  }

  /**
   * Based on updated API, calls are made until a proper result is returned
   * 'nug' error code is not mentioned in documentation for what it means.
   * 
   * TODO: Show message to the user if data at a certain location is not available
   */
  while (apiData.status === '' || apiData.status === 'nug') {
    apiData = (await axios.get('https://api.waqi.info/feed/geo:'+lat+';'+lng+'/', {
      params: {
        token: '157ae3a4ea08e71b5d0e6ed5096fbe6a90a01e0d',
        key: placeName
      }
    })).data;
  }


  /**
   * Store the data for offline usage using localForage
   * We store at most 30 places data and keep 15 most recent places stored
   * at all times
   */
  localforage.setItem(placeName, {
    apiData: apiData,
    time: new Date(),
    key: placeName
  })
  .then(() => {
    return localforage.keys();
  })
  .then(keys => {
    if (keys.length < 30) return;

    return Promise.all(
      keys.map(key => {
        return localforage.getItem(key)
      })
    );
  })
  .then(storedData => {
    if (!storedData) return;

    storedData.sort((a, b) => {
      return new Date(b.time) - new Date(a.time);
    });

    // Take the 15 most recent data
    storedData.splice(-15);

    // Clear the old data, and store the new array of data
    localforage.clear()
    .then(() => {
      storedData.forEach(data => {
        localforage.setItem(data.key, data);
      });
    })
    .catch(err => {
      console.log(err);
    })
  })
  .catch(err => {
    console.log(err);
  });

  // Calculate the distance of the place and add it to the API data
  if (!apiData.data.city.distance) {
    const stationCoords = new google.maps.LatLng(apiData.data.city.geo[0], apiData.data.city.geo[1]);
    apiData.data.city.distance = google.maps.geometry.spherical.computeDistanceBetween(coordsCurrent, stationCoords);
  }

  // Render the data to the DOM
  _renderDOM(apiData);

  // If the map is hidden then don't try to render AQI chart
  if (document.querySelector('.map').style.display === 'none') return;

  
  /** AQI chart rendering */

  // Bounds of the map which are displayed on the screen
  const bounds = map.getBounds().getSouthWest().lat()+','+map.getBounds().getSouthWest().lng()+','+map.getBounds().getNorthEast().lat()+','+map.getBounds().getNorthEast().lng();

  /**
   * Get additional data from the API using the bounds that we get above
   * to get centers near the point and generate the air quality view on the map
   */
  axios.get('https://api.waqi.info/map/bounds/?latlng='+bounds+'&token=157ae3a4ea08e71b5d0e6ed5096fbe6a90a01e0d')
  .then(response => {
    const mapData = response.data;
    const geometryFactory = new jsts.geom.GeometryFactory();

    if (unionPoly)
      unionPoly.setMap(null);

    /**
     * Get the distance between the latitude and longitude for the
     * aqi centre and the point at which the user wants aqi
     */
    distances = [];
    for (let i=0; i < mapData.data.length; i++) {
      if (mapData.data[i].aqi == '-')
        continue;
      const stationCoords = new google.maps.LatLng(mapData.data[i].lat, mapData.data[i].lon);

      // Add 1000m to the exact distance calculated
      const distance = google.maps.geometry.spherical.computeDistanceBetween(coordsCurrent, stationCoords)+1000;

      // Distances greater than 20km would not be rendered in the map
      if (distance > 20000) continue;

      distances.push({
        'distance': distance,
        'coords': stationCoords,
        'aqi': mapData.data[i].aqi
      });
    }

    // Sort the distances
    distances.sort((a,b) => {return (a.distance < b.distance) ? 1 : ((b.distance < a.distance) ? -1 : 0);});

    const JSTSpoly = [];
    let JSTSpolyUnion;

    for (let i=0; i < distances.length; i++) {
      // Only first 5 centre data is taken to keep processing simple
      if (i == 5)
        break;

      // Generate a circle based on centre, radius, number of points
      const shape = new google.maps.Polygon({
        paths: getCirclePoints(distances[i].coords, distances[i].distance, 80, true)
      });

      JSTSpoly.push(geometryFactory.createPolygon(geometryFactory.createLinearRing(googleMaps2JSTS(shape.getPath()))));
      JSTSpoly[i].normalize();

      /**
       * We take union of all the circles created to get a single polygon that
       * is to be rendered on the map
       */
      if (i == 0)
        JSTSpolyUnion = JSTSpoly[i];
      else
        JSTSpolyUnion = JSTSpolyUnion.union(JSTSpoly[i]);
    }

    const outputPath = jsts2googleMaps(JSTSpolyUnion); // Return the final polygon to be rendered
    unionPoly = new google.maps.Polygon({
      map: map,
      paths: outputPath,
      strokeColor: _getStrokeColor(apiData.data.aqi), // Set the colors based on the aqi data that we get
      strokeOpacity: 0.6,
      strokeWeight: 1,
      fillColor: _getStrokeColor(apiData.data.aqi),
      fillOpacity: 0.35
    });

    // Reset the zoom level of the map
    map.setZoom(14);
  })
  .catch(err => {
    console.log(err);
  });



  /**
   * Update the data after 15 seconds
  */
  timeout = setTimeout(() => {
    const initZoom = map.getZoom();

    map.setZoom(initZoom - 3);
    aqiCall(lat, lng, placeName).then(() => {
      map.setZoom(initZoom);
    })
  }, 15000);
}

/**
 * Shows the snackbar on the DOM with a message
 * time argument controls how long the snackbar is visible
 */
function _showSnackBar(message, time) {
  if (!message) return;

  const snackBar = document.querySelector('.snack-bar');
  const snackBarMessage = document.getElementById('snackMessage');
  const themeColor = document.getElementsByTagName('meta')['theme-color'];

  snackBarMessage.innerText = message;
  snackBar.style.display = 'flex';
  themeColor.content = '#363636';

  /** Close the snackbar if time is specified */
  if (time) {
    setTimeout(() => { 
      snackBar.style.display = 'none';
      snackBarMessage.innerText = '';
      themeColor.content = '#2ad09e';

    }, time);
  }
}

/**
 * Prepare the button for updating the Service Worker
 */
function _initSWUpdateBtn(worker) {
  if (!worker) return;

  const btn = document.getElementById('btnSwUpdate');

  btn.style.display = 'inline-flex';
  btn.addEventListener('click', () => {
    worker.postMessage({ action: 'skipWaiting' });
  });
}

/**
 * Hides the Maps and renders a list of places stored locally for which
 * AQI data can be accessed
 */
function _showOfflinePlaces() {
  // Hide the maps
  const mapsRef = document.querySelector('.map');
  mapsRef.style.display = 'none';

  const list = document.getElementById('offlinePlaces');
  list.innerHTML = '';
  localforage.iterate((data, key) => {
    if (!key || key === 'ip') return;

    const place = document.createElement('li');
    place.innerText = key;
    place.classList.add('card');
    place.addEventListener('click', () => {
      const geo = data.apiData.data.city.geo;
      aqiCall(geo[0], geo[1], key);
    });

    list.appendChild(place);
  });

  // Show the container
  list.parentElement.style.display = 'block';
}


const btnLegend = document.getElementById('expand-legend');
btnLegend.addEventListener('click', () => {
  const values = document.getElementById('aqi-values');
  const display = values.style.display;

  values.style.display = display === 'block' ? 'none' : 'block';

  const icon = btnLegend.getElementsByTagName('i')[0];

  icon.innerText = icon.innerText === 'expand_less' ? 'expand_more' : 'expand_less';
  
});