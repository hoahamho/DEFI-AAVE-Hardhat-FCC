const { ethers } = require("hardhat")
const { getWeth, AMOUNT } = require("../scripts/getWeht")

async function main() {
    await getWeth()
    accounts = await ethers.getSigners()
    const deployer = accounts[0]

    // LendingPoolAddressesProvider:  0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
    const lendingPool = await getLendingPool(deployer)
    console.log(`lending pool address: ${await lendingPool.getAddress()}`)

    // DEPOSIT
    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    // approve
    await approveErc20(wethTokenAddress, lendingPool, AMOUNT, deployer)
    console.log("Depositing...")
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
    console.log("Deplosited")

    // BORROW
    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(lendingPool, deployer)
    const daiPrice = await getDaiPrice()
    const amountDaiToBorrow = Number(availableBorrowsETH) * 0.95 * (1 / Number(daiPrice))
    console.log(`You can borrow ${amountDaiToBorrow} DAI`)
    const amountDaiBorrowWei = ethers.parseEther(amountDaiToBorrow.toString())
    console.log(`to WEI ${amountDaiBorrowWei}`)
    const daiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    await borrowDai(daiAddress, lendingPool, amountDaiBorrowWei, deployer)
    await getBorrowUserData(lendingPool, deployer)
    await repayDai(daiAddress, lendingPool, amountDaiBorrowWei, deployer)
    await getBorrowUserData(lendingPool, deployer)
}

async function repayDai(daiAddress, lendingPool, amountDaiBorrowWei, account) {
    await approveErc20(daiAddress, lendingPool, amountDaiBorrowWei, account)
    const repayTx = await lendingPool.repay(daiAddress, amountDaiBorrowWei, 1, account)
    await repayTx.wait(1)
    console.log("You have repaid!")
}

async function borrowDai(daiAddress, lendingPool, amountDaiBorrowWei, account) {
    const borrowTx = await lendingPool.borrow(daiAddress, amountDaiBorrowWei, 1, 0, account)
    await borrowTx.wait(1)
    console.log("Borrowed!")
}

async function getDaiPrice() {
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        "0x773616E4d11A78F511299002da57A0a94577F1f4",
    )
    const price = (await daiEthPriceFeed.latestRoundData())[1]
    console.log(`The DAI/ETH prive is ${price.toString()}`)
    return price
}

async function getBorrowUserData(lendingPool, account) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } = await lendingPool.getUserAccountData(account)
    console.log(`You have total ${totalCollateralETH} worth of ETH deposit`)
    console.log(`You have ${totalDebtETH} worth of ETH borrowed`)
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH`)
    return { availableBorrowsETH, totalDebtETH }
}

async function approveErc20(erc20Address, spenderAddress, amountToSpend, account) {
    const erc20Token = await ethers.getContractAt("IERC20", erc20Address, account)
    const tx = await erc20Token.approve(spenderAddress, amountToSpend)
    await tx.wait(1)
    console.log("Approved!")
}

async function getLendingPool(account) {
    const lendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        account,
    )
    const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool()
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account)
    return lendingPool
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
