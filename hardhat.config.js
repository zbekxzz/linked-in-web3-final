require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */

const INFURA_API_KEY = "8fe885b2b1634e9d9bbd0b87a13fc684";
const SEPOLIA_PRIVATE_KEY = "6ec88c3811a477abf3cbd4ac4fde4e5cc68b6f11770a2bf291d6a3fc17c70f23";

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/8fe885b2b1634e9d9bbd0b87a13fc684`,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
  },
};
