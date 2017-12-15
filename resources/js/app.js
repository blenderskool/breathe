function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

let map, initZoom;
let unionPoly;
let distances = [];
let IPgeo = JSON.parse(httpGet('https://freegeoip.net/json/'));

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
    fullscreenControl: false
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

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
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

      map.fitBounds(bounds);
      initZoom = map.getZoom();
      map.setZoom(initZoom - 3);
      aqiCall(place.geometry.location.lat(), place.geometry.location.lng());
      map.setZoom(initZoom);
    });
  });

}

//157ae3a4ea08e71b5d0e6ed5096fbe6a90a01e0d

/*
document.getElementById('txtMapSearch').addEventListener('keyup', function() {
  var customMapItems = document.getElementsByClassName('maps-custom-item');
  var _this = this;

  setTimeout(function () { // Delay to match with Google Search results
    if (_this.value) {
      for (var i = 0; i < customMapItems.length; i++)
        customMapItems[i].style.display = 'block';
    }
    else if (!_this.value) {
      for (var i = 0; i < customMapItems.length; i++)
        customMapItems[i].style.display = 'none';
    }

  }, 100);

});
document.getElementById('txtMapSearch').onblur = function() {
  var customMapItems = document.getElementById('customMapItems')
  for (var i = 0; i < customMapItems.length; i++)
    customMapItems[i].style.display = 'none';
}
document.getElementById('txtMapSearch').onfocus = function() {
  var customMapItems = document.getElementById('customMapItems')
  for (var i = 0; i < customMapItems.length; i++)
    customMapItems[i].style.display = 'block';
}
*/

function renderDOM(data) {

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

  for (var poll in data.data.iaqi) {
    if (data.data.iaqi.hasOwnProperty(poll) && getTitle(poll)) {
      var column = document.createElement('div');
      column.classList.add('column');

      var badge = document.createElement('div');
      badge.classList.add('badge', 'smallest', aqiCompare(data.data.iaqi[poll].v));
      badge.innerText = data.data.iaqi[poll].v;

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

  locObserved.innerText = data.data.city.name;
}


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


function renderMapShapes() {

  var triangleCoords = [
    {lat: 25.774, lng: -80.190},
    {lat: 18.466, lng: -66.118},
    {lat: 32.321, lng: -64.757},
    {lat: 25.774, lng: -80.190}
  ];

  // Construct the polygon.
  var bermudaTriangle = new google.maps.Polygon({
    paths: triangleCoords,
    strokeWeight: 0,
    fillColor: '#0ACD47',
    fillOpacity: 0.35
  });
  bermudaTriangle.setMap(map);
}

function aqiCall(lat, lng) {
  var cityCircle;
  var data = JSON.parse(httpGet('https://api.waqi.info/feed/geo:'+lat+';'+lng+'/?token=157ae3a4ea08e71b5d0e6ed5096fbe6a90a01e0d'));
  //var data = JSON.parse(httpGet('https://api.breezometer.com/baqi/?lat='+lat+'&lon='+lng+'&key=ecdfdf2a499d432983382635768127bd&fields=breezometer_aqibreezometer_aqi,country_aqi,pollutants,datetime'));

  var date = new Date();
  date.setDate(date.getDate()-1);
  date = date.toJSON();
  date = date.substring(0, date.length-5)
  var historyData = JSON.parse(httpGet('https://api.breezometer.com/baqi?datetime='+date+'&lat='+lat+'&lon='+lng+'&key=ecdfdf2a499d432983382635768127bd'));

  renderDOM(data);

  var bounds = map.getBounds().getSouthWest().lat()+','+map.getBounds().getSouthWest().lng()+','+map.getBounds().getNorthEast().lat()+','+map.getBounds().getNorthEast().lng();

  var mapData = JSON.parse(httpGet('https://api.waqi.info/map/bounds/?latlng='+bounds+'&token=157ae3a4ea08e71b5d0e6ed5096fbe6a90a01e0d'));
  var coordsCurrent = new google.maps.LatLng(lat, lng);
  var geometryFactory = new jsts.geom.GeometryFactory();

  if (unionPoly)
    unionPoly.setMap(null);

  distances = [];
  for (var i=0; i < mapData.data.length; i++) {
    if (mapData.data[i].aqi == '-')
      continue;
    var stationCoords = new google.maps.LatLng(mapData.data[i].lat, mapData.data[i].lon);

    var distance = google.maps.geometry.spherical.computeDistanceBetween(coordsCurrent, stationCoords)+1000;

    distances.push({
      'distance': distance,
      'coords': stationCoords,
      'aqi': mapData.data[i].aqi
    });
  }

  distances.sort(function(a,b) {return (a.distance < b.distance) ? 1 : ((b.distance < a.distance) ? -1 : 0);});

  var JSTSpoly = [];
  var JSTSpolyUnion;

  for (var i=0; i < distances.length; i++) {
    if (i == 5)
      break;

    var shape = new google.maps.Polygon({
      paths: getCirclePoints(distances[i].coords, distances[i].distance, 80, true)
    });

    JSTSpoly.push(geometryFactory.createPolygon(geometryFactory.createLinearRing(googleMaps2JSTS(shape.getPath()))));
    JSTSpoly[i].normalize();

    if (i == 0)
      JSTSpolyUnion = JSTSpoly[i];
    else
      JSTSpolyUnion = JSTSpolyUnion.union(JSTSpoly[i]);
  }

  var outputPath = jsts2googleMaps(JSTSpolyUnion);
  unionPoly = new google.maps.Polygon({
    map: map,
    paths: outputPath,
    strokeColor: getStrokeColor(data.data.aqi),
    strokeOpacity: 0.6,
    strokeWeight: 1,
    fillColor: getStrokeColor(data.data.aqi),
    fillOpacity: 0.35
  });

  map.setZoom(14);

}
