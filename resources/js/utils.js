var googleMaps2JSTS = function(boundaries) {
  var coordinates = [];
  for (var i = 0; i < boundaries.getLength(); i++) {
    coordinates.push(new jsts.geom.Coordinate(
      boundaries.getAt(i).lat(), boundaries.getAt(i).lng()));
  }
  return coordinates;
}

var jsts2googleMaps = function(geometry) {
  var coordArray = geometry.getCoordinates();
  GMcoords = [];
  for (var i = 0; i < coordArray.length; i++) {
    GMcoords.push(new google.maps.LatLng(coordArray[i].x, coordArray[i].y));
  }
  return GMcoords;
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
