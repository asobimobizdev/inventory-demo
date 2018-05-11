import ntc from "./ntc";

console.log("ntc", ntc);

class SeedParams {

  hueFromSeed(seed) {
    return (seed * 156.4223445) % 360;
  }

  nameForSeedWithHSL(seed, h, s, l) {
    return ntc.nameFromHSL(h, s, l)[1];
  }

  seedFromString(str) {
    const num = parseFloat(str);
    if (!Number.isNaN(num)) return num;
    str = String(str);
    return str
      .split("")
      .map(it => {
        return it.charCodeAt(0) * 0.12345678;
      })
      .reduce((a, b) => {
        return (a * b) % (Number.MAX_VALUE - 1);
      });
  }

}

export default new SeedParams();
