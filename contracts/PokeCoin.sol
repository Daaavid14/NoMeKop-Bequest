// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PokeCoin
 * @dev ERC20 token to simulate in-game currency.
 * Used for trades, rewards, and P2E features.
 * Anyone can mint tokens for testing/gameplay purposes.
 */
contract PokeCoin is ERC20, Ownable {
    constructor() ERC20("PokeCoin", "PKC") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 10 ** decimals()); // initial supply
    }

    // Public mint function - anyone can mint for testing
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    // Only owner can burn tokens
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}
