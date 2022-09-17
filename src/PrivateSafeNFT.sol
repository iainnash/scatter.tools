// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

contract PrivateSafeNFT is ERC721 {
    uint256 lastTokenId;
    address withdrawer;

    // simple public mint
    function mint() public {
        ++lastTokenId;
        _mint(msg.sender, lastTokenId);
    }

    // just metadata things
    function generateSVGPreview(uint256 tokenId) {
        return "<svg><text>HELO</text></svg>";
    }

    function base64Encode(bytes memory source, string memory contentType)
        internal
        returns (bytes memory)
    {
        return
            abi.encodePacked("data:", contentType, ",", Base64.encode(source));
    }

    function tokenURI(uint256 tokenId) public override returns (string memory) {
        return
            base64Encode(
                "application/json;utf-8",
                '{"name": "scatter [key]", "description": "this scatter key grants access to a randomly scattered set of crypto fragments", "image": "',
                generateSVGPreview(tokenId),
                '"}'
            );
    }

    function reveal(uint256 tokenId, string memory pass) {
        // 1 create2
        address instance = Clones.cloneDeterministic(
            withdrawer,
            keccak256(abi.encode(tokenId, pass))
        );
        // 2 alert user
        emit RevealedKeyNFT(tokenId, instance);
    }
}
