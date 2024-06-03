import "@typechain/hardhat"
import "@nomiclabs/hardhat-ethers"
import { ethers } from "hardhat";
import fs from "fs";

export const deployToken = async (path: string) => {
  if (fs.existsSync(path)) {
    console.log("Token already exists");
    return;
  }

  const privateLinkTokencontract = await ethers.getContractFactory("privateLinkToken");
  const privateLinkToken = await privateLinkTokencontract.deploy();

  console.log("privateLinkToken token deployed to:", privateLinkToken.address);

  fs.writeFileSync(path, privateLinkToken.address);
}