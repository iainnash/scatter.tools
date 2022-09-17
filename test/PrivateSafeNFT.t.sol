// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

import {PrivateSafeNFT} from "src/PrivateSafeNFT.sol";
import {Withdrawer} from "src/Withdrawer.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockNFT is ERC721 {
    constructor() ERC721("MKNFT","MKNFT") {
        for (uint256 i = 0; i < 10; i++) {
            _mint(msg.sender, i);
        }
    }
}

contract PrivateSafeNFTTest is Test {
    PrivateSafeNFT c;
    MockNFT nft;

    function setUp() public {
        c = new PrivateSafeNFT();
        nft = new MockNFT();
    }

    function testOwner() public {
        // mint to me
        uint256 newId = c.mint();
        address privateaddr = c.computeAddress(newId, "its a secret");
        nft.transferFrom(address(this), privateaddr, 1);

        c.reveal(1, "its a secret");
        Withdrawer(payable(privateaddr)).execute(
            address(nft),
            0,
            abi.encodeWithSelector(
                ERC721.transferFrom.selector,
                privateaddr,
                address(this),
                1
            )
        );
        assertEq(nft.ownerOf(1), address(this));
    }
}
