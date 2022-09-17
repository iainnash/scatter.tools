// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721ReceiverUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155ReceiverUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

struct Command {
    address target;
    uint256 value;
    bytes data;
}

error NotValidOwner();

contract Withdrawer is
    ERC165Upgradeable
    // EIP712Upgradeable
{
    IERC721 nft;
    uint256 tokenId;

    modifier onlyNFTOwner() {
      if (msg.sender != nft.ownerOf(tokenId)) {
        revert NotValidOwner();
      }
      _;
    }

    function initialize(IERC721 _nft, uint256 _tokenId) initializer public {
        nft = _nft;
        tokenId = _tokenId;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165Upgradeable)
        returns (bool)
    {
        // In addition to the current interfaceId, also support previous version of the interfaceId that did not
        // include the castVoteWithReasonAndParams() function as standard
        return
            interfaceId == type(IERC721ReceiverUpgradeable).interfaceId ||
            interfaceId == type(IERC1155ReceiverUpgradeable).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    receive() external payable {}

    function execute(address target, uint256 value, bytes calldata data) public onlyNFTOwner {
        (bool success, bytes memory returndata) = target.call{
            value: value
        }(data);
        Address.verifyCallResult(success, returndata, "execute failed");
    }

    function executeMultiple(Command[] memory commands) public onlyNFTOwner {
        for (uint256 i = 0; i < commands.length; i++) {
            (bool success, bytes memory returndata) = commands[i].target.call{
                value: commands[i].value
            }(commands[i].data);
            Address.verifyCallResult(success, returndata, "execute failed");
        }
    }
}
