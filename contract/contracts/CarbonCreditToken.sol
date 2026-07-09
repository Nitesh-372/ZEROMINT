// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract CarbonCreditToken is ERC1155, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    string public name = "Carbon Credit Token";
    string public symbol = "CCT";

    constructor(string memory _uri) ERC1155(_uri) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function mint(
        address account,
        uint256 projectId,
        uint256 amount,
        bytes memory data
    ) external onlyRole(MINTER_ROLE) {
        _mint(account, projectId, amount, data);
    }

    function adminTransfer(
        address from,
        address to,
        uint256 projectId,
        uint256 amount,
        bytes memory data
    ) external onlyRole(MINTER_ROLE) {
        _safeTransferFrom(from, to, projectId, amount, data);
    }

    function adminBurn(
        address account,
        uint256 projectId,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) {
        _burn(account, projectId, amount);
    }

    function burn(
        address account,
        uint256 projectId,
        uint256 amount
    ) external {
        require(
            account == msg.sender || isApprovedForAll(account, msg.sender),
            "Not owner nor approved"
        );
        _burn(account, projectId, amount);
    }

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
