function httpGet(theUrl) {
  /**
   * HTTP Get request using XMLHttpRequest
   */
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
  xmlHttp.send( null );
  return xmlHttp.responseText;
}

var map, initZoom;
var unionPoly;
var distances = [];
var IPgeo = JSON.parse(httpGet('https://freegeoip.net/json/'));

// Initializes the Google Maps
function initGMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: IPgeo.latitude, lng: IPgeo.longitude },
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
  google.maps.event.addListenerOnce(map, 'idle', function() {
    aqiCall(IPgeo.latitude, IPgeo.longitude);
  });

  // Create the search box and link it to the UI element.
  var input = document.getElementById('txtMapSearch');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('mapControls'));

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  /**
   * Listen for the event fired when the user selects a prediction and retrieve
   * more details for that place.
   */
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }

      /**
       * Fit the bounds of the map, zoom out of the map to get additional
       * centres and reset zoom after aqi data is received.
       */
      map.fitBounds(bounds);
      initZoom = map.getZoom();
      map.setZoom(initZoom - 3);
      aqiCall(place.geometry.location.lat(), place.geometry.location.lng());
      map.setZoom(initZoom);
    });
  });

}

async function renderDOM(data) {

  if (data.status == 'nope' || data.status == 'error')
    return;

  var badgeMain = document.getElementById('badgeMain');
  var badgeMainOtherToday = document.getElementById('badgeMainOtherToday');
  var containerPollutants = document.getElementById('pollutantDetails');
  var contPollutantsToday = document.getElementById('pollutantDetailsToday');
  containerPollutants.innerHTML = '';
  contPollutantsToday.innerHTML = '';

  var badgeOzoneOtherToday = document.getElementById('badgeOzoneOtherToday');
  var badgePMOtherToday = document.getElementById('badgePMOtherToday');

  var timeObserved = document.getElementById('timeObserved');
  var locObserved = document.getElementById('locObserved');
  var mainHealthMessage = document.getElementById('mainHealthMessage');
  var healthMessageOtherToday = document.getElementById('healthMessageOtherToday');

  badgeMain.classList = [];
  badgeMain.classList.add('badge');
  badgeMainOtherToday.classList = [];
  badgeMainOtherToday.classList.add('badge', 'small');

  var aqi = data.data.aqi;
  var time = new Date(data.data.time.v);

  /**
   * Add each pollutants level to the DOM
   */
  for (var poll in data.data.iaqi) {
    if (data.data.iaqi.hasOwnProperty(poll) && getTitle(poll)) {
      var column = document.createElement('div');
      column.classList.add('column');

      var badge = document.createElement('div');
      badge.classList.add('badge', 'smallest', aqiCompare(data.data.iaqi[poll].v));
      badge.innerText = Math.round(data.data.iaqi[poll].v*10)/10;

      if (data.data.dominentpol == poll)
        badge.classList.add('dominant');

      var title = document.createElement('div');
      title.classList.add('main-title');
      title.innerText = getTitle(poll);

      column.appendChild(badge);
      column.appendChild(title);
      containerPollutants.appendChild(column);

      if (data.data.dominentpol == poll || contPollutantsToday.children.length == 0)
        contPollutantsToday.appendChild(column.cloneNode(true));
    }
  }

  badgeMain.innerText = aqi;
  badgeMainOtherToday.innerText = aqi;
  badgeMain.classList.add(aqiCompare(aqi));
  badgeMainOtherToday.classList.add(aqiCompare(aqi));

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

  // badgeOzone.innerText = o3;
  // badgeOzoneOtherToday.innerText = o3;
  // badgeOzone.classList.add(aqiCompare(o3));
  // badgeOzoneOtherToday.classList.add(aqiCompare(o3));
  //
  // badgePM.innerText = pm;
  // badgePMOtherToday.innerText = pm;
  // badgePM.classList.add(aqiCompare(pm));
  // badgePMOtherToday.classList.add(aqiCompare(pm));

  timeObserved.innerText = time.getHours() + ':' + time.getMinutes();

  locObserved.innerText = Math.round(data.data.city.distance/1000)+'km - '+data.data.city.name;
}

/**
 * Returns the class name based on aqi level
 * This is used in css to render different colors for every aqi level
 */
function aqiCompare(aqi) {
  if (aqi <= 50)
    return 'good';
  else if (aqi <= 100)
    return 'moderate';
  else if (aqi <=  150)
    return 'unhealthy-moderate';
  else if (aqi <= 200)
    return 'unhealthy';
  else if (aqi <= 300)
    return 'very-unhealthy';
  else
    return 'hazardous';
}

/**
 * Returns the hex color code based on the aqi level provided
 */
function getStrokeColor(aqi) {
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
function getTitle(shortname) {
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
async function aqiCall(lat, lng) {
  var cityCircle;
  var coordsCurrent = new google.maps.LatLng(lat, lng);
  var apiData = {status: ''};

  /**
   * Based on updated API, calls are made until a proper result is returned
   * 'nug' error code is not mentioned in documentation for what it means.
   */
  while (apiData.status === '' || apiData.status === 'nug') {
    apiData = JSON.parse(httpGet('https://api.waqi.info/feed/geo:'+lat+';'+lng+'/?token=157ae3a4ea08e71b5d0e6ed5096fbe6a90a01e0d'));
  }
  // Calculate the distance of the place and add it to the API data
  var stationCoords = new google.maps.LatLng(apiData.data.city.geo[0], apiData.data.city.geo[1]);
  apiData.data.city.distance = google.maps.geometry.spherical.computeDistanceBetween(coordsCurrent, stationCoords);

  // Render the data to the DOM
  renderDOM(apiData);

  // Bounds of the map which are displayed on the screen
  var bounds = map.getBounds().getSouthWest().lat()+','+map.getBounds().getSouthWest().lng()+','+map.getBounds().getNorthEast().lat()+','+map.getBounds().getNorthEast().lng();

  // Additional data from the API using the bounds that we get above
  var mapData = JSON.parse(httpGet('https://api.waqi.info/map/bounds/?latlng='+bounds+'&token=157ae3a4ea08e71b5d0e6ed5096fbe6a90a01e0d'));
  var geometryFactory = new jsts.geom.GeometryFactory();

  if (unionPoly)
    unionPoly.setMap(null);

  /**
   * Get the distance between the lat and lng for the centre and the point
   * at which the user wants aqi
   */
  distances = [];
  for (var i=0; i < mapData.data.length; i++) {
    if (mapData.data[i].aqi == '-')
      continue;
    var stationCoords = new google.maps.LatLng(mapData.data[i].lat, mapData.data[i].lon);

    // Add 1000m to the exact distance calculated
    var distance = google.maps.geometry.spherical.computeDistanceBetween(coordsCurrent, stationCoords)+1000;

    // Distances greater than 20km would not be rendered in the map
    if (distance > 20000) continue;

    distances.push({
      'distance': distance,
      'coords': stationCoords,
      'aqi': mapData.data[i].aqi
    });
  }

  // Sort the distances
  distances.sort(function(a,b) {return (a.distance < b.distance) ? 1 : ((b.distance < a.distance) ? -1 : 0);});

  var JSTSpoly = [];
  var JSTSpolyUnion;

  for (var i=0; i < distances.length; i++) {
    // Only first 5 centre data is taken to keep processing simple
    if (i == 5)
      break;

    // Generate a circle based on centre, radius, number of points
    var shape = new google.maps.Polygon({
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

  var outputPath = jsts2googleMaps(JSTSpolyUnion); // Return the final polygon to be rendered
  unionPoly = new google.maps.Polygon({
    map: map,
    paths: outputPath,
    strokeColor: getStrokeColor(apiData.data.aqi), // Set the colors based on the aqi data that we get
    strokeOpacity: 0.6,
    strokeWeight: 1,
    fillColor: getStrokeColor(apiData.data.aqi),
    fillOpacity: 0.35
  });

  // Reset the zoom level of the map
  map.setZoom(14);

}
