# Hardhat DEFI-AAVE

Task to be finished:

-   Deposit collateral: convert ETH to WETH, then deplosit to aave
-   Borrow another asset: DAI
-   Repay DAI

1. Can not run:

```shell
hh run scripts/aaveBorrow.js
```

run:

```shell
yarn hardhat run scripts/aaveBorrow.js
```

hardhat-shorthand was installed.

2. Use: `ethers.getSigners()` in stead of `getNamedAccounts()`
