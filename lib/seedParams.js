import { BigNumber } from "bignumber.js";
import assets from "@/assets/assets.json";
import randGen from "random-seed";

class SeedParams {

  seedFromString(seed) {
    const number = new BigNumber(seed);
    const result = number.mod(4096).toNumber();
    return result;
  }

  assetsIdWithSeed(seed) {
    const len = Object.keys(assets).length;
    const rnd = randGen(seed);
    let number = rnd.intBetween(1, len);
    return number.toString().padStart(4, "0");
  }

  assetsThumbPathWithSeed(seed) {
    let id = this.assetsIdWithSeed(seed);
    return `/assets/${id}/thumb.png`;
  }

  nameForSeed(seed) {
    let id = this.assetsIdWithSeed(seed);
    return assets[id].name;
  }

}

export default new SeedParams();
