import "@typechain/hardhat"
import "@nomiclabs/hardhat-ethers"
import hre, { ethers } from "hardhat";
import fs from "fs";
import { deployToken } from "./deployToken";
import { deployVerifier } from "./deployVerifier";
import { deployHasher } from "./deployHasher";

const deploy = async () => {
  const outDir = `./scripts/out/${hre.network.name}/`;

  if (!fs.existsSync) {
    fs.mkdirSync(outDir);
  }

  const tokenPath = `${outDir}token.address`;
  if (!fs.existsSync(tokenPath)) {
    await deployToken(tokenPath);
  }

  const verifierPath = `${outDir}verifier.address`;
  if (!fs.existsSync(verifierPath)) {
    await deployVerifier(verifierPath);
  }

  const hasherPath = `${outDir}hasher.address`;
  if (!fs.existsSync(hasherPath)) {
    await deployHasher(hasherPath);
  }

  const amount = ethers.utils.parseEther("1");

  const tokenAddress = fs.readFileSync(tokenPath, "utf8");
  const verifierAddress = fs.readFileSync(verifierPath, "utf8");
  const hasherAddress = fs.readFileSync(hasherPath, "utf8");

  const privateLinkcontract = await ethers.getContractFactory("privateLink");
  const privateLink = await privateLinkcontract.deploy(tokenAddress, amount, verifierAddress, 10, hasherAddress);
  console.log("privateLink deployed to:", privateLink.address);

  fs.writeFileSync(`${outDir}privateLink.address`, privateLink.address);
}

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });