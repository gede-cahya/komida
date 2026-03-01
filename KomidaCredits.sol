// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title KomidaCredits
 * @dev Smart contract untuk manajemen credits Komida di Base Chain
 * 
 * Fitur:
 * - Purchase credits dengan ETH
 * - Spend credits untuk beli items
 * - Withdraw ETH untuk owner
 * - Event tracking untuk semua transaksi
 */
contract KomidaCredits {
    address public owner;
    address public pendingOwner;
    
    // Mapping user address ke credit balance
    mapping(address => uint256) public credits;
    
    // Credit packs configuration
    struct CreditPack {
        uint256 credits;
        uint256 priceWei;
        bool active;
    }
    
    mapping(uint256 => CreditPack) public creditPacks;
    uint256 public creditPackCount;
    
    // Events
    event CreditsPurchased(address indexed user, uint256 amount, uint256 ethPaid);
    event CreditsSpent(address indexed user, uint256 amount, string itemType, uint256 itemId);
    event CreditsWithdrawn(address indexed owner, uint256 amount);
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event CreditPackAdded(uint256 indexed packId, uint256 credits, uint256 priceWei);
    event CreditPackUpdated(uint256 indexed packId, bool active);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyPendingOwner() {
        require(msg.sender == pendingOwner, "Only pending owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
        
        // Initialize default credit packs
        _addCreditPack(100, 0.0001 ether);
        _addCreditPack(550, 0.0005 ether);  // 500 + 50 bonus
        _addCreditPack(1150, 0.001 ether);  // 1000 + 150 bonus
        _addCreditPack(6000, 0.005 ether);  // 5000 + 1000 bonus
    }
    
    /**
     * @dev Purchase credits dengan mengirim ETH
     * @param creditAmount Jumlah credits yang mau dibeli
     * 
     * Requirements:
     * - Harus mengirim ETH yang sesuai dengan pack price
     * - Credit pack harus active
     */
    function purchaseCredits(uint256 creditAmount) external payable {
        require(msg.value > 0, "Must send ETH");
        require(credits[msg.sender] + creditAmount > credits[msg.sender], "Overflow");
        
        // Verify ETH amount matches a credit pack
        bool validPack = false;
        for (uint256 i = 0; i < creditPackCount; i++) {
            CreditPack memory pack = creditPacks[i];
            if (pack.active && pack.credits == creditAmount && pack.priceWei == msg.value) {
                validPack = true;
                break;
            }
        }
        
        require(validPack, "Invalid ETH amount for credit pack");
        
        credits[msg.sender] += creditAmount;
        
        emit CreditsPurchased(msg.sender, creditAmount, msg.value);
    }
    
    /**
     * @dev Purchase credits berdasarkan pack ID
     * @param packId ID dari credit pack
     */
    function purchaseCreditsByPack(uint256 packId) external payable {
        require(packId < creditPackCount, "Invalid pack ID");
        
        CreditPack memory pack = creditPacks[packId];
        require(pack.active, "Pack not active");
        require(msg.value == pack.priceWei, "Incorrect ETH amount");
        require(credits[msg.sender] + pack.credits > credits[msg.sender], "Overflow");
        
        credits[msg.sender] += pack.credits;
        
        emit CreditsPurchased(msg.sender, pack.credits, msg.value);
    }
    
    /**
     * @dev Spend credits untuk purchase item
     * @param amount Jumlah credits yang mau dibelanjakan
     * @param itemType Tipe item (badge/decoration)
     * @param itemId ID dari item
     * 
     * Requirements:
     * - User harus punya credits yang cukup
     */
    function spendCredits(uint256 amount, string calldata itemType, uint256 itemId) external {
        require(credits[msg.sender] >= amount, "Insufficient credits");
        require(bytes(itemType).length > 0, "Invalid item type");
        
        credits[msg.sender] -= amount;
        
        emit CreditsSpent(msg.sender, amount, itemType, itemId);
    }
    
    /**
     * @dev Transfer ownership (2-step process)
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        pendingOwner = newOwner;
        
        emit OwnershipTransferStarted(owner, newOwner);
    }
    
    /**
     * @dev Accept ownership transfer
     */
    function acceptOwnership() external onlyPendingOwner {
        address oldOwner = owner;
        owner = pendingOwner;
        pendingOwner = address(0);
        
        emit OwnershipTransferred(oldOwner, owner);
    }
    
    /**
     * @dev Withdraw ETH (owner only)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdraw failed");
        
        emit CreditsWithdrawn(owner, balance);
    }
    
    /**
     * @dev Withdraw specific amount (owner only)
     * @param amount Amount to withdraw
     */
    function withdrawAmount(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        
        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "Withdraw failed");
        
        emit CreditsWithdrawn(owner, amount);
    }
    
    /**
     * @dev Add credit pack (owner only)
     * @param credits Amount of credits
     * @param priceWei Price in wei
     */
    function addCreditPack(uint256 credits, uint256 priceWei) external onlyOwner {
        _addCreditPack(credits, priceWei);
    }
    
    function _addCreditPack(uint256 credits, uint256 priceWei) internal {
        uint256 packId = creditPackCount;
        creditPacks[packId] = CreditPack({
            credits: credits,
            priceWei: priceWei,
            active: true
        });
        creditPackCount++;
        
        emit CreditPackAdded(packId, credits, priceWei);
    }
    
    /**
     * @dev Update credit pack status (owner only)
     * @param packId Pack ID
     * @param active New active status
     */
    function updateCreditPack(uint256 packId, bool active) external onlyOwner {
        require(packId < creditPackCount, "Invalid pack ID");
        
        creditPacks[packId].active = active;
        
        emit CreditPackUpdated(packId, active);
    }
    
    /**
     * @dev Emergency withdraw for specific user (owner only)
     * @param user User address
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address user, uint256 amount) external onlyOwner {
        require(credits[user] >= amount, "Insufficient user credits");
        
        credits[user] -= amount;
        
        // In production, you might want to add a refund mechanism
        emit CreditsSpent(user, amount, "emergency", 0);
    }
    
    /**
     * @dev Get contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get credit pack details
     * @param packId Pack ID
     */
    function getCreditPack(uint256 packId) external view returns (uint256 credits, uint256 priceWei, bool active) {
        require(packId < creditPackCount, "Invalid pack ID");
        CreditPack memory pack = creditPacks[packId];
        return (pack.credits, pack.priceWei, pack.active);
    }
    
    /**
     * @dev Get all active credit packs
     */
    function getActiveCreditPacks() external view returns (uint256[] memory packIds, uint256[] memory creditsList, uint256[] memory prices) {
        // Count active packs
        uint256 count = 0;
        for (uint256 i = 0; i < creditPackCount; i++) {
            if (creditPacks[i].active) {
                count++;
            }
        }
        
        packIds = new uint256[](count);
        creditsList = new uint256[](count);
        prices = new uint256[](count);
        
        uint256 index = 0;
        for (uint256 i = 0; i < creditPackCount; i++) {
            if (creditPacks[i].active) {
                packIds[index] = i;
                creditsList[index] = creditPacks[i].credits;
                prices[index] = creditPacks[i].priceWei;
                index++;
            }
        }
        
        return (packIds, creditsList, prices);
    }
}
