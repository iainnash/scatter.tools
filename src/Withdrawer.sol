// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721ReceiverUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155ReceiverUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

struct Command {
  address target;
  uint256 value;
  bytes[] data;
}

contract Withdrawer is ERC165Upgradeable, EIP712Upgradeable, IERC721ReceiverUpgradeable, IERC1155ReceiverUpgradeable {
  function initialize() initializer {

  }
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165Upgradeable, ERC165Upgradeable)
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

    function execute(Command[] calldata commands) {
      for (uint i = 0; i < commands.length; i++) {
        (bool success, bytes memory returndata) = targets[i].call{value: values[i]}(calldatas[i]);
        Address.verifyCallResult(success, returndata);
      }
    }
}
