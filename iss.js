// iss.js

const request = require('request');

/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */

const fetchMyIP = (callback) => {
  // use request to fetch IP address from JSON API
  request(`https://api.ipify.org/?format=json`, (error, response, body) => {
    // error can be set if invalid domain, user is offline, etc.
    if (error) return callback(error, null);

    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    
    // All is good, pass the data along
    const ip = JSON.parse(body).ip;
    callback(error, ip);
  });
};

const fetchCoordsByIP = (ip, cb) => {
  request(`http://ipwho.is/${ip}`, (error, response, body) => {
    // error can be set if invalid domain, user is offline, etc.
    if (error) return cb(error, null);

    // if non-200 status, assume server error
    const parsedBdy = JSON.parse(body);
    if (!parsedBdy.success) {
      const msg = `Success status was false. Server message says: ${parsedBdy.message} when fetching IP ${ip}`;
      cb(Error(msg), null);
      return;
    }

    // All is good, process and pass data along
    const { latitude, longitude } = parsedBdy;
    cb(null, { latitude, longitude });
  });
};

/**
 * Makes a single API request to retrieve upcoming ISS fly over times the for the given lat/lng coordinates.
 * Input:
 *   - An object with keys `latitude` and `longitude`
 *   - A callback (to pass back an error or the array of resulting data)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly over times as an array of objects (null if error). Example:
 *     [ { risetime: 134564234, duration: 600 }, ... ]
 */

const fetchISSFlyOverTimes = (coords, cb) => {
  const url = `https://iss-flyover.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`;
  request(url, (error, response, body) => {
    // error can be set if invalid domain, user is offline, etc.
    if (error) return cb(error, null);

    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching flyover times. Response: ${body}`;
      cb(Error(msg), null);
      return;
    }

    // All is good, process and pass data along
    const passes = JSON.parse(body).response;
    cb(null, passes);
  });
};

/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results.
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */
const nextISSTimesForMyLocation = (cb) => {
  fetchMyIP((error, ip) => {
    if (error) return cb(error, null);

    fetchCoordsByIP(ip, (error, coords) => {
      if (error) return cb(error, null);

      fetchISSFlyOverTimes(coords, (error, passes) => {
        if (error) return cb(error, null);

        cb(null, passes);
      });
    });
  });
};

module.exports = { nextISSTimesForMyLocation };