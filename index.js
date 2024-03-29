const fs = require("fs");

async function readInput(inputPath) {
  const input = await fs.promises.readFile(inputPath, "utf-8");
  return input.trim().split("\n");
}

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

function getBestMatch(drivers, addresses) {
  let bestScore = 0;
  let bestMatch = null;
  drivers.forEach((driver) => {
    addresses.forEach((address) => {
      const score = getSuitabilityScore(address, driver);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { address, driver };
      }
    });
  });

  return { score: bestScore, match: bestMatch };
}

async function run() {
  const addressFile = process.argv[2];
  const driverFile = process.argv[3];

  let [drivers, addresses] = await Promise.all([
    readInput(driverFile),
    readInput(addressFile)
  ]);

  const assignments = {};
  let totalSuitabilityScore = 0;

  while (addresses.length) {
    const { score, match } = getBestMatch(drivers, addresses);
    const { address, driver } = match;

    assignments[address] = [driver, score];
    totalSuitabilityScore += score;

    // remove assigned driver and address from list
    drivers = drivers.filter((d) => d !== driver);
    addresses = addresses.filter((a) => a !== address);
  }

  console.log({ assignments, totalSuitabilityScore });
}

run();
