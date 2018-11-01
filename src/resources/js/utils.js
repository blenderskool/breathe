function googleMaps2JSTS(boundaries) {
  const coordinates = [];
  for (let i=0; i < boundaries.getLength(); i++) {
    coordinates.push(new jsts.geom.Coordinate(boundaries.getAt(i).lat(), boundaries.getAt(i).lng()));
  }
  return coordinates;
}

function jsts2googleMaps(geometry) {
  if (!geometry) return;
  
  const coordArray = geometry.getCoordinates();
  const GMcoords = [];
  for (let i=0; i < coordArray.length; i++) {
    GMcoords.push(new google.maps.LatLng(coordArray[i].x, coordArray[i].y));
  }
  return GMcoords;
}

function getCirclePoints(center, radius, numPoints, clockwise) {
  const points = [];
  for (let i=0; i < numPoints; ++i) {
    let angle = i * 360 / numPoints;
    if (!clockwise) {
      angle = 360-angle;
    }
    
    // the maps API provides geometrical computations
    const p = google.maps.geometry.spherical.computeOffset(center, radius, angle);
    points.push(p);
  }
  
  // 'close' the polygon
  points.push(points[0]);
  return points;
}
