'use strict';
// var loaderUtils = require('loader-utils');
var solc = require('solc');
var path = require("path");
var fs = require("fs");

function findImports(p) {
  const read = (p) => {
    return {
      contents: fs.readFileSync(p, "utf8"),
    };
  };
  if (fs.existsSync(p)) {
    return read(p);
  }
  // Attempt 1, node_modules:
  const fullPath = path.join("node_modules", p);
  if (fs.existsSync(fullPath)) {
    return read(fullPath);
  }
  throw "File " + p + " not found";
}

module.exports = function (source) {
  const input = {
    language: "Solidity",
    sources: {
      "file": {
        content: source,
      },
    },
    settings: {
      evmVersion: "byzantium",
      outputSelection: {
        // Enable the metadata and bytecode outputs of every single contract.
        "*": {
          "*": [
            "abi", "evm.bytecode.object",
          ],
        },
      },
    },
  };

  const output = solc.compileStandardWrapper(
    JSON.stringify(input),
    findImports,
  );

  const outData = JSON.parse(output);
  for (let error of outData.errors || []) {
    if (error.severity == "error") {
      throw new Error(error.message);
    }
  }
  let jsContent = "module.exports = {";
  for (let contractFile in outData.contracts) {
    const contracts = outData.contracts[contractFile];
    contractFile = contractFile.split("/").pop().split(".sol")[0];
    for (let contractName in contracts) {
      const contract = contracts[contractName];
      const contractOut = {
        abi: contract.abi,
        bytecode: contract.evm.bytecode.object,
      };
      jsContent += `${contractName}: ${JSON.stringify(contractOut)},\n`;
    }
  }
  jsContent += "};";
  return jsContent;
};
