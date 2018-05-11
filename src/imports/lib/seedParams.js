import ntc from "./ntc";

import {BigNumber} from "bignumber.js";

const ADJECTIVES = [
  "Agile",
  "Cheeky",
  "Cursed",
  "Decentralized",
  "Deceptive",
  "Distributed",
  "Docile",
  "Gentle",
  "Graceful",
  "Humble",
  "Nimble",
  "Quick",
  "Raging",
  "Slow",
  "Successful",
  "Violent",
];

const ANIMALS = [
  "Bonobo",
  "Cassowary",
  "Cheetah",
  "Crocodile",
  "Elephant",
  "Frog",
  "Gorilla",
  "Hippopotamus",
  "Leopard",
  "Orang-utan",
  "Panda",
  "Penguin",
  "Rhinoceros",
  "Tamarin",
  "Tortoise",
  "Wolf",
];

class SeedParams {

  hueFromSeed(seed) {
    const calculated = (seed) % 360;
    return calculated;
  }

  nameForSeedWithHSL(seed, h, s, l) {
    const lowestByte = seed & 0xFF;
    const nibble1 = lowestByte & 0xF;
    const nibble2 = lowestByte >> 4;
    const adjective = ADJECTIVES[nibble1];
    const color = ntc.nameFromHSL(h, s, l)[1];
    const animal = ANIMALS[nibble1];
    return `${adjective} ${color} ${animal}`;
  }

  seedFromString(seed) {
    const number = new BigNumber(seed);
    const result = number.mod(4096).toNumber();
    return result;
  }
}

export default new SeedParams();
