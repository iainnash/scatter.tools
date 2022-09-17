// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

import "src/PrivateSafeNFT.sol";

contract PrivateSafeNFT is Test {
    PrivateSafeNFT c;

    function setUp() public {
        c = new Contract();
    }
}
