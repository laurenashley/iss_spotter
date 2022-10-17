// iss.js

/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */

const request = require('request');

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
    cb(null, {latitude, longitude});
  });
};

module.exports = {
  fetchMyIP,
  fetchCoordsByIP
};