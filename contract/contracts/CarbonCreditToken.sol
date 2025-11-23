// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CarbonCreditToken
 * @dev ERC1155 token where each tokenId represents credits from a project.
 * Only accounts with MINTER_ROLE can mint/burn tokens (registry, admin).
 */
contract CarbonCreditToken is ERC1155, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // Optional: name & symbol for UI
    string public name = "Carbon Credit Token";
    string public symbol = "CCT";

    constructor(string memory _uri) ERC1155(_uri) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /// @notice Mint credits for a given projectId (tokenId) to an account
    function mint(
        address account,
        uint256 projectId,
        uint256 amount,
        bytes memory data
    ) external onlyRole(MINTER_ROLE) {
        _mint(account, projectId, amount, data);
    }

    /// @notice Burn credits of a given projectId from an account (for retiring)
    function burn(
        address account,
        uint256 projectId,
        uint256 amount
    ) external {
        // Allow self-burn or approved operator burn
        require(
            account == msg.sender || isApprovedForAll(account, msg.sender),
            "Not owner nor approved"
        );
        _burn(account, projectId, amount);
    }

    /// ✅ IMPORTANT: resolve multiple inheritance (ERC1155 + AccessControl)
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
