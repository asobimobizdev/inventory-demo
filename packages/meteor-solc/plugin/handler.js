const fs = Npm.require("fs");
const path = Npm.require("path");
const solc = Npm.require("solc");


class SolidityCompiler {
  findImports(p) {
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
    return {
      error: "File not found",
    };
  }

  // WIP
  // Refer to
  // https://solidity.readthedocs.io/en/develop/using-the-compiler.html#compiler-input-and-output-json-description
  // https://docs.meteor.com/api/packagejs.html#build-plugin-compilers
  processFilesForTarget(files) {
    files.forEach((file) => {
      const fileName = file.getPathInPackage();
      if (/node_modules\/.+sol/.test(fileName)) {
        return;
      }

      const input = {
        language: "Solidity",
        sources: {
          "file": {
            content: file.getContentsAsString(),
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
        this.findImports,
      );

      const outData = JSON.parse(output);
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

      file.addJavaScript({
        data: jsContent,
        path: `${file.getPathInPackage()}.js`,
      });
    });
  }
}

Plugin.registerCompiler({
  extensions: ["sol"],
}, () => new SolidityCompiler);