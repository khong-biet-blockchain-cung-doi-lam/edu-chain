// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract LogsContract {
    
    struct ActivityLog {
        address actor;      
        string action;      
        uint256 timestamp;  
        string details;     
    }

    ActivityLog[] public logs;
    
    address public accessControlAddress;

    constructor(address _accessControlAddress) {
        accessControlAddress = _accessControlAddress;
    }

    function addLog(address _actor, string memory _action, string memory _details) public {
        
        logs.push(ActivityLog(_actor, _action, block.timestamp, _details));
    }
    
    function getLogCount() public view returns (uint256) {
        return logs.length;
    }
}
