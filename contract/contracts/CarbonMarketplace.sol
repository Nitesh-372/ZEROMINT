// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./CarbonCreditToken.sol";

/**
 * @title CarbonMarketplace
 * @dev Simple marketplace to list and buy carbon credits (ERC1155 tokens) for ETH.
 */
contract CarbonMarketplace is ReentrancyGuard {
    struct Listing {
        uint256 id;
        address seller;
        uint256 projectId;       // tokenId in ERC1155
        uint256 amount;          // number of credits
        uint256 priceWei;        // total price in wei (for all amount)
        bool active;
    }

    uint256 public listingCount;
    CarbonCreditToken public carbonToken;
    address public feeRecipient;
    uint256 public feeBps = 200; // 2% fee (basis points: 10000 = 100%)

    mapping(uint256 => Listing) public listings;

    event Listed(
        uint256 indexed listingId,
        address indexed seller,
        uint256 projectId,
        uint256 amount,
        uint256 priceWei
    );
    event Cancelled(uint256 indexed listingId);
    event Purchased(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 priceWei
    );

    constructor(address _carbonToken, address _feeRecipient) {
        carbonToken = CarbonCreditToken(_carbonToken);
        feeRecipient = _feeRecipient;
    }

    /**
     * @notice List credits for sale. Seller must approve marketplace as operator.
     */
    function createListing(
        uint256 _projectId,
        uint256 _amount,
        uint256 _priceWei
    ) external nonReentrant {
        require(_amount > 0, "amount = 0");
        require(_priceWei > 0, "price = 0");

        // Transfer credits from seller to marketplace (escrow)
        carbonToken.safeTransferFrom(
            msg.sender,
            address(this),
            _projectId,
            _amount,
            ""
        );

        listingCount++;
        uint256 newId = listingCount;

        listings[newId] = Listing({
            id: newId,
            seller: msg.sender,
            projectId: _projectId,
            amount: _amount,
            priceWei: _priceWei,
            active: true
        });

        emit Listed(newId, msg.sender, _projectId, _amount, _priceWei);
    }

    /**
     * @notice Cancel listing, return credits back to seller.
     */
    function cancelListing(uint256 _listingId) external nonReentrant {
        Listing storage l = listings[_listingId];
        require(l.active, "Not active");
        require(l.seller == msg.sender, "Not seller");

        l.active = false;

        // Return credits
        carbonToken.safeTransferFrom(
            address(this),
            l.seller,
            l.projectId,
            l.amount,
            ""
        );

        emit Cancelled(_listingId);
    }

    /**
     * @notice Buy the entire listing with ETH.
     */
    function buy(uint256 _listingId) external payable nonReentrant {
        Listing storage l = listings[_listingId];
        require(l.active, "Not active");
        require(msg.value == l.priceWei, "Incorrect ETH sent");

        l.active = false;

        // Fee calculation
        uint256 fee = (msg.value * feeBps) / 10000;
        uint256 sellerAmount = msg.value - fee;

        // Payout seller
        (bool ok1, ) = payable(l.seller).call{value: sellerAmount}("");
        require(ok1, "Seller payment failed");

        // Platform fee
        (bool ok2, ) = payable(feeRecipient).call{value: fee}("");
        require(ok2, "Fee payment failed");

        // Transfer credits to buyer
        carbonToken.safeTransferFrom(
            address(this),
            msg.sender,
            l.projectId,
            l.amount,
            ""
        );

        emit Purchased(_listingId, msg.sender, msg.value);
    }

    // Optional: update fee recipient / fee
    function setFeeRecipient(address _recipient) external {
        require(msg.sender == feeRecipient, "Only current feeRecipient");
        feeRecipient = _recipient;
    }

    function setFeeBps(uint256 _feeBps) external {
        require(msg.sender == feeRecipient, "Only feeRecipient");
        require(_feeBps <= 1000, "Fee too high (>10%)");
        feeBps = _feeBps;
    }
}
