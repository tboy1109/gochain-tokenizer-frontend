// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AssetToken is ERC20, Ownable {
    uint256 public MAX_SUPPLY;
    address public titleTokenContractAddr;
    uint256 public titleTokenId;
    uint8 dcmls;

    constructor(
        string memory name,
        string memory symbol,
        uint256 totalsupply,
        uint8 dc,
        address tToken,
        uint256 tokenId
    ) ERC20(name, symbol) {
        MAX_SUPPLY = totalsupply * (10**dc);
        titleTokenContractAddr = tToken;
        titleTokenId = tokenId;
        dcmls = dc;
        _mint(msg.sender, MAX_SUPPLY);
    }

    function mint(uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds Max Supply.");
        _mint(msg.sender, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return dcmls;
    }
}
