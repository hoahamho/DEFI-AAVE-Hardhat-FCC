const { ethers } = require("hardhat")

const AMOUNT = ethers.parseEther("0.01")

async function getWeth() {
    accounts = await ethers.getSigners()
    const deployer = accounts[0]
    // call "deposit" function on the weth contract
    // abi: (copy contract and compile)
    // Mainnet Weth contract address: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
    const iWeth = await ethers.getContractAt(
        "IWeth",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        deployer,
    )
    const tx = await iWeth.deposit({ value: AMOUNT })
    await tx.wait(1)
    const wethBalance = await iWeth.balanceOf(deployer)
    console.log(`Got ${wethBalance.toString()} WETH`)
}

module.exports = { getWeth, AMOUNT }
