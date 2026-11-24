// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * Axelvor (AXLV)
 * - Max supply: 1,000,000,000,000 (1 trillion)
 * - Hold continuously for 30 days → claim 1000 AXLV bonus
 * - Keep holding → claim another 1000 for each extra completed month
 * - Selling to zero resets the hold timer (must start over)
 *
 * Bonuses are paid from the reward pool (fund via fundRewardPool).
 */
contract Axelvor is ERC20, Ownable, ReentrancyGuard {
    uint256 public constant MAX_SUPPLY = 1_000_000_000_000 * 10 ** 18;
    uint256 public constant HOLD_PERIOD = 30 days;
    uint256 public constant MONTHLY_BONUS = 1000 * 10 ** 18;

    mapping(address => uint256) public holdStartedAt;
    /// @dev How many full hold-months this address has already claimed for the current hold streak
    mapping(address => uint256) public claimedMonths;

    event RewardFunded(address indexed from, uint256 amount);
    event BonusClaimed(address indexed account, uint256 monthsClaimed, uint256 amount);
    event HoldStarted(address indexed account, uint256 startedAt);
    event HoldReset(address indexed account);

    constructor(address initialOwner) ERC20("Axelvor", "AXLV") Ownable(initialOwner) {
        _mint(initialOwner, MAX_SUPPLY);
        holdStartedAt[initialOwner] = block.timestamp;
        emit HoldStarted(initialOwner, block.timestamp);
    }

    function fundRewardPool(uint256 amount) external nonReentrant {
        require(amount > 0, "amount=0");
        _transfer(msg.sender, address(this), amount);
        emit RewardFunded(msg.sender, amount);
    }

    function rewardPoolBalance() public view returns (uint256) {
        return balanceOf(address(this));
    }

    function isEligible(address account) public view returns (bool) {
        return pendingBonus(account) > 0;
    }

    /// @notice Completed hold-months in the current continuous streak
    function completedHoldMonths(address account) public view returns (uint256) {
        uint256 started = holdStartedAt[account];
        if (started == 0 || balanceOf(account) == 0) return 0;
        return (block.timestamp - started) / HOLD_PERIOD;
    }

    /// @notice Unclaimed bonus amount for this account
    function pendingBonus(address account) public view returns (uint256) {
        uint256 completed = completedHoldMonths(account);
        uint256 already = claimedMonths[account];
        if (completed <= already) return 0;
        return (completed - already) * MONTHLY_BONUS;
    }

    /// @notice Claim 1000 AXLV for each completed continuous hold month not yet claimed
    function claimBonus() external nonReentrant {
        address account = msg.sender;
        require(balanceOf(account) > 0, "not holding");

        uint256 completed = completedHoldMonths(account);
        uint256 already = claimedMonths[account];
        require(completed > already, "nothing to claim");

        uint256 monthsToPay = completed - already;
        uint256 amount = monthsToPay * MONTHLY_BONUS;
        require(rewardPoolBalance() >= amount, "empty pool");

        claimedMonths[account] = completed;
        _transfer(address(this), account, amount);

        emit BonusClaimed(account, monthsToPay, amount);
    }

    function _update(address from, address to, uint256 value) internal override {
        super._update(from, to, value);

        if (from != address(0) && from != address(this) && balanceOf(from) == 0) {
            holdStartedAt[from] = 0;
            claimedMonths[from] = 0;
            emit HoldReset(from);
        }

        if (to != address(0) && to != address(this)) {
            if (balanceOf(to) == value) {
                // Fresh holder (was zero)
                holdStartedAt[to] = block.timestamp;
                claimedMonths[to] = 0;
                emit HoldStarted(to, block.timestamp);
            } else if (holdStartedAt[to] == 0) {
                holdStartedAt[to] = block.timestamp;
                claimedMonths[to] = 0;
                emit HoldStarted(to, block.timestamp);
            }
        }
    }
}
