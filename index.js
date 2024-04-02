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
    score = getConsonants(driver);
  }

  if (hasCommonFactors(streetAddress.length, driver.length)) {
    score = score += score / 2;
  }

  return score;
}

function getBestPossibility(senerios) {
  let bestScore = 0;
  let bestMatch = null;
  senerios.forEach((senerio) => {
    let senerioScore = 0;
    senerio.forEach((assignment) => {
      senerioScore += getSuitabilityScore(
        assignment.address,
        assignment.driver
      );
    });

    if (senerioScore > bestScore) {
      bestScore = senerioScore;
      bestMatch = senerio;
    }
  });

  return { totalSuitabilityScore: bestScore, assignments: bestMatch };
}

function getArrayCombinations(array) {
  const combinations = [];
  if (array.length === 0) {
    return [[]];
  }
  for (let i = 0; i < array.length; i++) {
    const currentElement = array[i];
    const remainingElements = array.slice(0, i).concat(array.slice(i + 1));
    const remainingCombinations = getArrayCombinations(remainingElements);
    for (let j = 0; j < remainingCombinations.length; j++) {
      combinations.push([currentElement].concat(remainingCombinations[j]));
    }
  }
  return combinations;
}

function getAllPossibilites(addresses, drivers) {
  const senerios = getArrayCombinations(drivers);
  return senerios.map((driverList) => {
    const assignment = [];
    for (let i = 0; i < addresses.length; i++) {
      assignment.push({ driver: driverList[i], address: addresses[i], score: getSuitabilityScore(addresses[i], driverList[i]) });
    }
    return assignment;
  });
}

async function run() {
  const addressFile = process.argv[2];
  const driverFile = process.argv[3];

  let [drivers, addresses] = await Promise.all([
    readInput(driverFile),
    readInput(addressFile),
  ]);

  const possibilites = getAllPossibilites(addresses, drivers);
  const best = getBestPossibility(possibilites);
  console.log(best);
}

run();
