const fs = require("fs");
const munkresAlgorithm = require('munkres-algorithm');

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
    // the base SS is the number of vowels in the driver’s name multiplied by 1.5.
    score = getVowelCount(driver) * 1.5;
  } else {
    // the base SS is the number of consonants in the driver’s name multiplied by 1.
    score = getConsonants(driver);
  }

  // If the length of the shipment's destination street name shares 
  // any commonfactors with the length of the driver’s name, the SS is increased by 50%
  if (hasCommonFactors(streetAddress.length, driver.length)) {
    score = score += score / 2;
  }

  return score;
}

/**
 * generates list mapping [address][driver]=score
 */
function createMatrix(addresses, drivers) {
  let costMatrix = [];
  // we need matrix to be same number of cols and rows so setting invalid combinations to 0 so they wont be selected
  const max = drivers.length > addresses.length ? drivers.length : addresses.length; 
  for (let i = 0; i < max; ++i) {
    for (let j = 0; j < max; ++j) {
      if (!costMatrix[i]) costMatrix[i] = [];
      if (!addresses[j] || !drivers[i]) {
        costMatrix[i][j] = 0;
      } else {
        costMatrix[i][j] = -getSuitabilityScore(addresses[i], drivers[j]);
      }
    }
  }

  return costMatrix;
}

async function run() {
  const addressFile = process.argv[2];
  const driverFile = process.argv[3];

  let [drivers, addresses] = await Promise.all([
    readInput(driverFile),
    readInput(addressFile),
  ]);

  const matrix = createMatrix(addresses, drivers);
  // Uses the Hungarian algorithm to caluclate optimal configuration
  const results = munkresAlgorithm.minWeightAssign(matrix);
  const formattedResults = results.assignments.map((driverIndex, index) => {
    return { address: addresses[index], driver: drivers[driverIndex], score: getSuitabilityScore(addresses[index], drivers[driverIndex]) }
  });
  console.log({ assignments: formattedResults, score:-results.assignmentsWeight});
}

run();
