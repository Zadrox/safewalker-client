const midpoint = (src, dest) => {
  return {
    latitude: (src.latitude + dest.latitude)/2,
    longitude: (src.longitude + dest.longitude)/2,
  }
}

const calcBez = (src, mid, dest, stepping, sSq, invStepping, invSSq) =>
  (invSSq * src) + (2 * invStepping * stepping * mid) + (sSq * dest);

export default BezierCurve = function(src, dest) {
  const mid = midpoint(src, dest);
  const curvepts = [];

  if (Math.abs(src.latitude - dest.latitude) < 0.0002) {
    mid.latitude += Math.abs(src.longitude - dest.longitude);
  } else if (Math.abs(src.longitude - dest.longitude) < 0.0002) {
    mid.longitude += Math.abs(src.latitude - dest.latitude);
  } else if (src.latitude > dest.latitude) {
    mid.latitude = src.latitude;
  } else {
    mid.latitude = dest.latitude;
  }

  curvepts.push({latitude: src.latitude, longitude: src.longitude});

  const step = 1.0/200;

  for (let stepping = 0; stepping <= 1.0; stepping += step) {
      const invStepping = (1.0 - stepping);
      const invSteppingSq = Math.pow(invStepping, 2);
      const steppingSquared = Math.pow(stepping, 2);

      const longitude = calcBez(src.longitude, mid.longitude, dest.longitude,
        stepping, steppingSquared, invStepping, invSteppingSq);

      const latitude = calcBez(src.latitude, mid.latitude, dest.latitude,
        stepping, steppingSquared, invStepping, invSteppingSq);

      curvepts.push({latitude, longitude});
  }

  curvepts.push({latitude: dest.latitude, longitude: dest.longitude});

  return curvepts;
}
