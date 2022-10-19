// index.js

const { nextISSTimesForMyLocation } = require('./iss');

nextISSTimesForMyLocation((error, passTimes) => {
  if (error) {
    return console.log("It didn't work!", error);
  }
  
  // Print results
  for (const i of passTimes) {
    const dateTime = new Date(0);
    dateTime.getUTCSeconds(i.risetime);
    console.log(`Next pass at ${dateTime} for ${i.duration} seconds!`);
  }
});