function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

let map;
let IPgeo = JSON.parse(httpGet('https://freegeoip.net/json/'));

// Initializes the Google Maps
function initGMap() {
    map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: IPgeo.latitude, lng: IPgeo.longitude },
    zoom: 8,
    maxZoom: 15,
    mapTypeId: 'roadmap',
    mapTypeControl: false,
    streetViewControl: false,
    zoomControl: false,
    fullscreenControl: false
  });

  // Create the search box and link it to the UI element.
  var input = document.getElementById('txtMapSearch');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

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

      aqiCall(place.geometry.location.lat(), place.geometry.location.lng());

    });

    map.fitBounds(bounds);
  });

}

//157ae3a4ea08e71b5d0e6ed5096fbe6a90a01e0d
let data = JSON.parse(httpGet('https://api.waqi.info/feed/geo:'+IPgeo.latitude+';'+IPgeo.longitude+'/?token=157ae3a4ea08e71b5d0e6ed5096fbe6a90a01e0d'));
renderDOM(data);

function renderDOM(data) {
  var badgeMain = document.getElementById('badgeMain');
  var badgeMainOtherToday = document.getElementById('badgeMainOtherToday');

  var badgeOzone = document.getElementById('badgeOzone');
  var badgePM = document.getElementById('badgePM');
  var badgeOzoneOtherToday = document.getElementById('badgeOzoneOtherToday');
  var badgePMOtherToday = document.getElementById('badgePMOtherToday');

  var timeObserved = document.getElementById('timeObserved');
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

  if (data.data.dominentpol == 'pm10' || !data.data.iaqi.hasOwnProperty('o3')) {
    if (!data.data.iaqi.hasOwnProperty('pm25')) {
      pm = data.data.iaqi.pm10.v;
      document.getElementById('txtPM').innerText = '(PM 1.0)';
    }
    else {
      pm = data.data.iaqi.pm25.v;
      document.getElementById('txtPM').innerText = '(PM 2.5)';
    }
  }
  else {
    o3 = data.data.iaqi.o3.v;
    pm = data.data.iaqi.pm25.v;
    document.getElementById('txtPM').innerText = '(PM 2.5)';
    document.getElementById('txtPollutant').innerText = 'Ozone';
  }

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
    document.getElementById('txtPollutant').innerText = 'SO<sub>2</sub>';
  }
  else if (data.data.iaqi.hasOwnProperty('co')) {
    o3 = data.data.iaqi.co.v;
    document.getElementById('txtPollutant').innerText = 'CO';
  }


  if (data.data.dominentpol == 'pm10') {
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

  var data = JSON.parse(httpGet('https://api.waqi.info/feed/geo:'+lat+';'+lng+'/?token=157ae3a4ea08e71b5d0e6ed5096fbe6a90a01e0d'));

  console.log(data);
  renderDOM(data);
}
