import ntc from "./ntc";

import {BigNumber} from "bignumber.js";

ADJECTIVES = [
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
]

ANIMALS = [
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
]

class SeedParams {

  hueFromSeed(seed) {
    return (seed * 156.4223445) % 360;
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
    const result = number.mod(2 ^ 16).toNumber();
    return result;
  }
}

export default new SeedParams();
