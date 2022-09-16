// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract PrivateSafeNFT is ERC721 {
  uint256 _tokenId;
  function mint() public {
    ++_tokenId;
    _mint(msg.sender, tokenId);
  }
  function tokenURI() override public returns (string memory) {
    // safe URI
  }

  function reveal(string memory word) {
    
  }
}
