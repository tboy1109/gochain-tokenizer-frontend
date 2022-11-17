// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

interface usdcInterface {
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external;

    function balanceOf(address account) external view returns (uint256);
}

contract TitleToken is ERC721Enumerable {
    uint256 public totalMinted;
    // Mapping from token ID to tokenURI
    mapping(uint256 => string) tokenUris;
    mapping(uint256 => string) names;
    mapping(uint256 => string) smbls;
    mapping(uint256 => uint256) ttlSupply;
    mapping(uint256 => mapping(address => uint256)) balances;
    mapping(uint256 => uint8) decimals;
    mapping(uint256 => address[]) assetOwners;
    mapping(uint256 => uint256) prices;
    uint256[] saleTokenIds;
    struct Sale {
        address seller;
        uint256 amount;
    }
    mapping(uint256 => Sale[]) saleTokens;
    address usdcContractAddress = 0x3328358128832A260C76A4141e19E2A943CD4B6D;

    modifier owningTitleToken(uint256 tokenId) {
        require(
            ownerOf(tokenId) == msg.sender,
            "You are not owner of title token"
        );
        _;
    }

    modifier titleTokenExists(uint256 tokenId) {
        require(_exists(tokenId), "This token does not exist");
        _;
    }

    modifier hasNoAssetContract(uint256 tokenId) {
        require(ttlSupply[tokenId] == 0, "Asset Contract is already set");
        _;
    }

    modifier hasAssetContract(uint256 tokenId) {
        require(ttlSupply[tokenId] > 0, "Asset Contract is not set");
        _;
    }

    modifier owningTotalAssetTokens(uint256 tokenId) {
        require(
            balances[tokenId][msg.sender] == ttlSupply[tokenId],
            "You are not owning total asset tokens"
        );
        _;
    }

    event Minted(address minter, address recipient, uint256 tokenId);
    event AssetContractSet(uint256 tokenId, address assetContractAddr);
    event Burned(uint256 tokenId);
    event TransferAsset(address account, uint256 tokenId, uint256 amount);
    event CreateSale(address seller, uint256 tokenId, uint256 amount);
    event RemoveSale(address seller, uint256 tokenId, uint256 amount);

    constructor() ERC721("TitleToken", "TT") {}

    function mint(string memory path, address addr) external {
        _safeMint(addr, ++totalMinted);
        tokenUris[totalMinted] = path;
        emit Minted(msg.sender, addr, totalMinted);
    }

    function createAsset(
        uint256 tokenId,
        uint256 ttlSpl,
        string memory name,
        string memory smbl,
        uint8 dcml,
        uint256 price
    )
        external
        titleTokenExists(tokenId)
        owningTitleToken(tokenId)
        hasNoAssetContract(tokenId)
    {
        names[tokenId] = name;
        smbls[tokenId] = smbl;
        decimals[tokenId] = dcml;
        ttlSupply[tokenId] = ttlSpl * (10**dcml);
        balances[tokenId][msg.sender] = ttlSpl * (10**dcml);
        prices[tokenId] = price;
        assetOwners[tokenId].push(msg.sender);
    }

    function getName(uint256 tokenId)
        external
        view
        titleTokenExists(tokenId)
        hasAssetContract(tokenId)
        returns (string memory)
    {
        return names[tokenId];
    }

    function getSymbol(uint256 tokenId)
        external
        view
        titleTokenExists(tokenId)
        hasAssetContract(tokenId)
        returns (string memory)
    {
        return smbls[tokenId];
    }

    function getDecimal(uint256 tokenId)
        external
        view
        titleTokenExists(tokenId)
        hasAssetContract(tokenId)
        returns (uint8)
    {
        return decimals[tokenId];
    }

    function getPrice(uint256 tokenId)
        external
        view
        titleTokenExists(tokenId)
        hasAssetContract(tokenId)
        returns (uint256)
    {
        return prices[tokenId];
    }

    function getTokenBalance(uint256 tokenId, address addr)
        public
        view
        titleTokenExists(tokenId)
        hasAssetContract(tokenId)
        returns (uint256)
    {
        return balances[tokenId][addr];
    }

    function getTotalSupply(uint256 tokenId)
        public
        view
        titleTokenExists(tokenId)
        hasAssetContract(tokenId)
        returns (uint256)
    {
        return ttlSupply[tokenId];
    }

    function burn(uint256 tokenId)
        external
        titleTokenExists(tokenId)
        hasAssetContract(tokenId)
        owningTotalAssetTokens(tokenId)
    {
        _burn(tokenId);
        ttlSupply[tokenId] = 0;
        balances[tokenId][msg.sender] = 0;
        emit Burned(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        titleTokenExists(tokenId)
        returns (string memory)
    {
        return tokenUris[tokenId];
    }

    function getTokenBalances(address addr)
        public
        view
        returns (uint256[] memory tokenIds, uint256[] memory blncs)
    {
        uint256 i;
        uint256 length = 0;
        for (i = 1; i <= totalMinted; ++i) {
            if (ttlSupply[i] > 0 && balances[i][addr] > 0) {
                ++length;
            }
        }
        tokenIds = new uint256[](length);
        blncs = new uint256[](length);
        length = 0;
        for (i = 1; i <= totalMinted; ++i) {
            if (ttlSupply[i] > 0 && balances[i][addr] > 0) {
                tokenIds[length] = i;
                blncs[length++] = balances[i][addr];
            }
        }
        return (tokenIds, blncs);
    }

    function getAssetDistribution(uint256 tokenId)
        external
        view
        titleTokenExists(tokenId)
        hasAssetContract(tokenId)
        returns (address[] memory, uint256[] memory)
    {
        uint256 length = assetOwners[tokenId].length;
        uint256[] memory amounts = new uint256[](length);
        uint256 i;
        for (i = 0; i < length; ++i) {
            amounts[i] = balances[tokenId][assetOwners[tokenId][i]];
        }
        return (assetOwners[tokenId], amounts);
    }

    function transferAsset(
        uint256 tokenId,
        address destination,
        uint256 amount
    ) external titleTokenExists(tokenId) hasAssetContract(tokenId) {
        require(balances[tokenId][msg.sender] >= amount, "Insufficient Asset");
        balances[tokenId][msg.sender] -= amount;
        uint256 i;
        uint256 length;
        if (balances[tokenId][msg.sender] == 0) {
            length = assetOwners[tokenId].length;
            for (i = 0; assetOwners[tokenId][i] != msg.sender; ++i) {}
            assetOwners[tokenId][i] = assetOwners[tokenId][length - 1];
            assetOwners[tokenId].pop();
        }
        if (balances[tokenId][destination] == 0) {
            assetOwners[tokenId].push(destination);
        }
        balances[tokenId][destination] += amount;
        emit TransferAsset(msg.sender, tokenId, amount);
    }

    function createSale(uint256 tokenId, uint256 amount)
        external
        titleTokenExists(tokenId)
        hasAssetContract(tokenId)
    {
        require(
            balances[tokenId][msg.sender] >= amount,
            "Insufficient asset to create sale"
        );
        balances[tokenId][msg.sender] -= amount;
        uint256 i;
        uint256 length = saleTokenIds.length;
        for (i = 0; i < length && saleTokenIds[i] != tokenId; ++i) {}
        if (i == length) {
            saleTokenIds.push(tokenId);
        }
        length = saleTokens[tokenId].length;
        for (
            i = 0;
            i < length && saleTokens[tokenId][i].seller != msg.sender;
            ++i
        ) {}
        if (i < length) {
            saleTokens[tokenId][i].amount += amount;
        } else {
            saleTokens[tokenId].push(Sale(msg.sender, amount));
        }
        if (balances[tokenId][msg.sender] == 0) {
            length = assetOwners[tokenId].length;
            for (i = 0; assetOwners[tokenId][i] != msg.sender; ++i) {}
            assetOwners[tokenId][i] = assetOwners[tokenId][length - 1];
            assetOwners[tokenId].pop();
        }
        emit CreateSale(msg.sender, tokenId, amount);
    }

    function removeSale(uint256 tokenId, uint256 amount)
        external
        titleTokenExists(tokenId)
        hasAssetContract(tokenId)
    {
        uint256 i;
        uint256 length = saleTokens[tokenId].length;
        for (
            i = 0;
            i < length && saleTokens[tokenId][i].seller != msg.sender;
            ++i
        ) {}
        require(i < length, "No sale for that asset");
        require(
            saleTokens[tokenId][i].amount >= amount,
            "Insufficient sale to remove"
        );
        saleTokens[tokenId][i].amount -= amount;
        if (balances[tokenId][msg.sender] == 0) {
            assetOwners[tokenId].push(msg.sender);
        }
        balances[tokenId][msg.sender] += amount;
        if (saleTokens[tokenId][i].amount == 0) {
            saleTokens[tokenId][i] = saleTokens[tokenId][length];
            saleTokens[tokenId].pop();
            if (length == 1) {
                length = saleTokenIds.length;
                for (i = 0; saleTokenIds[i] != tokenId; ++i) {}
                saleTokenIds[i] = saleTokenIds[length - 1];
                saleTokenIds.pop();
            }
        }
        emit RemoveSale(msg.sender, tokenId, amount);
    }

    function getSaleTokenIds() external view returns (uint256[] memory) {
        return saleTokenIds;
    }

    function getSales()
        external
        view
        returns (
            uint256[] memory tokenIds,
            address[] memory sellers,
            uint256[] memory amounts
        )
    {
        uint256 length;
        uint256 i;
        uint256 j;
        uint256 saleTokenIdLength = saleTokenIds.length;
        uint256 curlength;
        uint256 current;
        for (i = 0; i < saleTokenIdLength; ++i) {
            length += saleTokens[saleTokenIds[i]].length;
        }
        tokenIds = new uint256[](length);
        sellers = new address[](length);
        amounts = new uint256[](length);
        for (i = 0; i < saleTokenIdLength; ++i) {
            curlength = saleTokens[saleTokenIds[i]].length;
            for (j = 0; j < curlength; ++j) {
                tokenIds[current] = saleTokenIds[i];
                sellers[current] = saleTokens[saleTokenIds[i]][j].seller;
                amounts[current] = saleTokens[saleTokenIds[i]][j].amount;
            }
        }
        return (tokenIds, sellers, amounts);
    }

    function purchase(
        uint256 tokenId,
        address seller,
        uint256 amount
    ) external {
        uint256 length = saleTokens[tokenId].length;
        uint256 i;
        for (
            i = 0;
            i < length &&
                (saleTokens[tokenId][i].seller != seller ||
                    saleTokens[tokenId][i].amount < amount);
            ++i
        ) {}
        require(i < length, "No such sale");
        require(
            usdcInterface(usdcContractAddress).balanceOf(msg.sender) >=
                prices[tokenId] * amount,
            "Insufficient USDC"
        );
        usdcInterface(usdcContractAddress).transferFrom(
            msg.sender,
            seller,
            prices[tokenId] * amount
        );
        saleTokens[tokenId][i].amount -= amount;
        if (saleTokens[tokenId][i].amount == 0) {
            saleTokens[tokenId][i] = saleTokens[tokenId][length - 1];
            saleTokens[tokenId].pop();
            if (length == 1) {
                length = saleTokenIds.length;
                for (i = 0; saleTokenIds[i] != tokenId; ++i) {}
                saleTokenIds[i] = saleTokenIds[length - 1];
                saleTokenIds.pop();
            }
        }
        if (balances[tokenId][msg.sender] == 0) {
            assetOwners[tokenId].push(msg.sender);
        }
        balances[tokenId][msg.sender] += amount;
    }
}
