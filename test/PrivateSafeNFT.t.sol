// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

import "src/PrivateSafeNFT.sol";

contract PrivateSafeNFT is Test {
    PrivateSafeNFT c;

    function setUp() public {
        c = new Contract();
    }

    function testBar() public {
        assertEq(uint256(1), uint256(1), "ok");
    }

    function testFoo(uint256 x) public {
        vm.assume(x < type(uint128).max);
        assertEq(x + x, x * 2);
    }
}