// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Marketplace is Ownable {
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price; // in wei
        bool active;
    }

    IERC721 public nftContract;
    mapping(uint256 => Listing) public listings;

    event Listed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event Sale(uint256 indexed tokenId, address indexed buyer, uint256 price);
    event Cancelled(uint256 indexed tokenId);

    constructor(address _nftContract) Ownable(msg.sender) {
        nftContract = IERC721(_nftContract);
    }

    function listNFT(uint256 tokenId, uint256 price) external {
        require(price > 0, "Price must be > 0");
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not NFT owner");
        nftContract.transferFrom(msg.sender, address(this), tokenId);
        listings[tokenId] = Listing(tokenId, msg.sender, price, true);
        emit Listed(tokenId, msg.sender, price);
    }

    function buyNFT(uint256 tokenId) external payable {
        Listing memory item = listings[tokenId];
        require(item.active, "Not listed");
        require(msg.value >= item.price, "Insufficient ETH");

        listings[tokenId].active = false;
        payable(item.seller).transfer(item.price);
        nftContract.transferFrom(address(this), msg.sender, tokenId);

        emit Sale(tokenId, msg.sender, item.price);
    }

    function cancelListing(uint256 tokenId) external {
        Listing memory item = listings[tokenId];
        require(item.seller == msg.sender, "Not seller");
        listings[tokenId].active = false;
        nftContract.transferFrom(address(this), msg.sender, tokenId);
        emit Cancelled(tokenId);
    }

    function getListing(uint256 tokenId) external view returns (Listing memory) {
        return listings[tokenId];
    }
}
