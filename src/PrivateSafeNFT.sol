// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Withdrawer} from "./Withdrawer.sol";

error NotValidNFTOwner();

contract PrivateSafeNFT is ERC721 {
    uint256 lastTokenId;
    Withdrawer immutable withdrawer;

    constructor() ERC721("ScatterKey", "SKTRKEY") {
        withdrawer = new Withdrawer();
    }

    event RevealedKeyNFT(uint256 tokenId, address instance);

    // simple public mint
    function mint() public returns (uint256) {
        ++lastTokenId;
        _mint(msg.sender, lastTokenId);
        return lastTokenId;
    }

    // just metadata things
    function generateSVGPreview(uint256) internal pure returns (bytes memory) {
        return "<svg><text>HELO</text></svg>";
    }

    function base64Encode(string memory contentType, bytes memory source)
        internal
        pure
        returns (bytes memory)
    {
        return
            abi.encodePacked("data:", contentType, "base64,", Base64.encode(source));
    }

    function tokenURI(uint256 tokenId)
        public
        pure
        override
        returns (string memory)
    {
        return
            string(
                base64Encode(
                    "application/json;",
                    abi.encodePacked(
                        '{"name": "scatter [key]", "description": "this scatter key grants access to a randomly scattered set of crypto fragments", "image": "',
                        generateSVGPreview(tokenId),
                        '"}'
                    )
                )
            );
    }

    function _getHashKey(uint256 tokenId, string memory pass)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode(tokenId, pass));
    }

    function reveal(uint256 tokenId, string memory pass) public {
        if (msg.sender != ownerOf(tokenId)) {
            revert NotValidNFTOwner();
        }
        // 1 create2
        address instance = Clones.cloneDeterministic(
            address(withdrawer),
            _getHashKey(tokenId, pass)
        );
        // setup access control
        Withdrawer(payable(instance)).initialize(this, tokenId);
        // 2 alert user
        emit RevealedKeyNFT(tokenId, instance);
    }

    function computeAddress(uint256 tokenId, string memory pass)
        public
        view
        returns (address)
    {
        return
            Clones.predictDeterministicAddress(
                address(withdrawer),
                _getHashKey(tokenId, pass)
            );
    }

    function computeAddresses(uint256 tokenId, string[] memory passes)
        public
        view
        returns (address[] memory addresses)
    {
        addresses = new address[](passes.length);
        for (uint256 i = 0; i < passes.length; i++) {
            addresses[i] = computeAddress(tokenId, passes[i]);
        }
    }
}
