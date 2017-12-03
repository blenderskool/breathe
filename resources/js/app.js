function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

let map, initZoom;
let shapes = [];
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

  var badgeOzone = document.getElementById('badgeOzone');
  var badgePM = document.getElementById('badgePM');
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

  badgeOzone.classList = [];
  badgeOzone.classList.add('badge', 'small');
  badgeOzoneOtherToday.classList = [];
  badgeOzoneOtherToday.classList.add('badge', 'smallest');

  badgePM.classList = [];
  badgePM.classList.add('badge', 'small');
  badgePMOtherToday.classList = [];
  badgePMOtherToday.classList.add('badge', 'smallest');

  var aqi = data.data.aqi;
  var time = new Date(data.data.time.v);

  if (data.data.iaqi.hasOwnProperty('o3')) {
    o3 = data.data.iaqi.o3.v;
    document.getElementById('txtPollutant').innerText = 'Ozone';
  }
  else if (data.data.iaqi.hasOwnProperty('no2')) {
    o3 = data.data.iaqi.no2.v;
    document.getElementById('txtPollutant').innerHTML = 'NO<sub>2</sub>';
  }
  else if (data.data.iaqi.hasOwnProperty('so2')) {
    o3 = data.data.iaqi.so2.v;
    document.getElementById('txtPollutant').innerHTML = 'SO<sub>2</sub>';
  }
  else if (data.data.iaqi.hasOwnProperty('co')) {
    o3 = data.data.iaqi.co.v;
    document.getElementById('txtPollutant').innerText = 'CO';
  }


  if (data.data.dominentpol == 'pm10' || !data.data.iaqi.hasOwnProperty('pm25')) {
    pm = data.data.iaqi.pm10.v;
    document.getElementById('txtPM').innerText = '(PM 1.0)';
  }
  else {
    pm = data.data.iaqi.pm25.v;
    document.getElementById('txtPM').innerText = '(PM 2.5)';
  }

  badgeMain.innerText = aqi;
  badgeMainOtherToday.innerText = aqi;
  badgeMain.classList.add(aqiCompare(aqi));
  badgeMainOtherToday.classList.add(aqiCompare(aqi));

  if (aqi <= 50) {
    mainHealthMessage.innerText = 'Enjoy your day';
    healthMessageOtherToday.innerText = 'Enjoy your day';
  }
  else if (aqi > 50 && aqi < 100) {
    mainHealthMessage.innerText = 'Limit Outdoor Exertion, use mask';
    healthMessageOtherToday.innerText = 'Limit Outdoor Exertion, use mask';
  }
  else {
    badgeMain.classList.add('unhealthy-moderate');
    healthMessageOtherToday.innerText = 'Limit Outdoor Exertion completely';
  }

  badgeOzone.innerText = o3;
  badgeOzoneOtherToday.innerText = o3;
  badgeOzone.classList.add(aqiCompare(o3));
  badgeOzoneOtherToday.classList.add(aqiCompare(o3));

  badgePM.innerText = pm;
  badgePMOtherToday.innerText = pm;
  badgePM.classList.add(aqiCompare(pm));
  badgePMOtherToday.classList.add(aqiCompare(pm));

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

  renderDOM(data);

  var bounds = map.getBounds().getSouthWest().lat()+','+map.getBounds().getSouthWest().lng()+','+map.getBounds().getNorthEast().lat()+','+map.getBounds().getNorthEast().lng();

  var mapData = JSON.parse(httpGet('https://api.waqi.info/map/bounds/?latlng='+bounds+'&token=157ae3a4ea08e71b5d0e6ed5096fbe6a90a01e0d'));
  var coordsCurrent = new google.maps.LatLng(lat, lng);

  if (shapes.length != 0) {
    for (var i = 0; i < shapes.length; i++) {
      shapes[i].setMap(null);
    }
  }

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

  for (var i=0; i < distances.length; i++) {

    if (i < distances.length - 5)
      continue;

    if (i != distances.length-1) {
      var shape = new google.maps.Polygon({
        paths: [getCirclePoints(distances[i].coords, distances[i].distance, 80, true),
                getCirclePoints(distances[i+1].coords, distances[i+1].distance, 80, false)],
        strokeColor: getStrokeColor(distances[i].aqi),
        strokeOpacity: 0.7,
        strokeWeight: 1,
        fillColor: getStrokeColor(distances[i].aqi),
        fillOpacity: 0.2
      });
      shape.setMap(map);
      shapes.push(shape);
   }
   else {
      var shape = new google.maps.Circle({
        strokeColor: getStrokeColor(distances[i].aqi),
        strokeOpacity: 0.7,
        strokeWeight: 1,
        fillColor: getStrokeColor(distances[i].aqi),
        fillOpacity: 0.2,
        map: map,
        center: distances[i].coords,
        radius: distances[i].distance
      });
      shape.setMap(map);
      shapes.push(shape);
   }
  }

  map.setZoom(14);

}

function getCirclePoints(center, radius, numPoints, clockwise) {
  var points = [];
  for (var i = 0; i < numPoints; ++i) {
      var angle = i * 360 / numPoints;
      if (!clockwise) {
          angle = 360 - angle;
      }

      // the maps API provides geometrical computations
      // just make sure you load the required library (libraries=geometry)
      var p = google.maps.geometry.spherical.computeOffset(center, radius, angle);
      points.push(p);
  }

  // 'close' the polygon
  points.push(points[0]);
  return points;
}
