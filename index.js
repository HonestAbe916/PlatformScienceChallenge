const fs = require("fs");

const readInput = (inputPath) => {
  const input = fs.readFileSync(inputPath, "utf-8").trim().split("\n");
  return input;
};

function getVowelCount(str) {
  var m = str.match(/[aeiou]/gi);
  return m === null ? 0 : m.length;
}

function getConsonants(str) {
  return str.split("").filter((e) => e.match(/[^aeiou]/) != null).length;
}

function parseStreetAddress(address) {
  return address.split(",")[0];
}

function getfactors(number) {
  return Array.from(Array(number + 1), (_, i) => i).filter(
    (i) => number % i === 0
  );
}

function hasCommonFactors(streetLen, driverLen) {
  const f1 = getfactors(streetLen);
  const f2 = getfactors(driverLen);

  // check if we have matching common factors besides for 1
  return f1.find((n) => n !== 1 && f2.includes(n));
}

function getSuitabilityScore(address, driver) {
  const streetAddress = parseStreetAddress(address);
  let score = 0;
  if (streetAddress.length % 2 == 0) {
    score = getVowelCount(driver) * 1.5;
  } else {
    score = getConsonants(driver) * 1;
  }

  if (hasCommonFactors(streetAddress.length, driver.length)) {
    score = score += score / 2;
  }

  return score;
}

function getBestDriver(address, drivers) {
  let bestScore = 0;
  let bestDriver = null;
  for (let i = 0; i < drivers.length; i++) {
    const score = getSuitabilityScore(address, drivers[i]);
    if (score > bestScore) {
      bestDriver = drivers[i];
      bestScore = score;
    }
  }

  return { score: bestScore, driver: bestDriver };
}

async function run() {
  const addressFile = process.argv[2];
  const driverFile = process.argv[3];

  let drivers = readInput(driverFile);
  const addresses = readInput(addressFile);
  const assignments = {};
  let totalSuitabilityScore = 0;

  // assign each address to best matching driver
  addresses.forEach((address) => {
    const res = getBestDriver(address, drivers);
    assignments[address] = [res.driver, res.score];
    totalSuitabilityScore += res.score;

    // remove driver from list of available drivers
    drivers = drivers.filter((d) => d !== res.driver);
  });

  console.log({ assignments, totalSuitabilityScore });
}

run();
