// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IAccessControl {
    function hasRole(address _account, string memory _roleName) external view returns (bool);
}

contract LogsManagerContract {
    IAccessControl public accessControl;
    
    struct LogEntry {
        address actor;               
        string action;               
        bytes32 recordId;            
        uint256 timestamp;           
        string metadata;             
        bool exists;
    }
    
    LogEntry[] public logs;
    
    mapping(address => uint256[]) public logsByActor;
    mapping(bytes32 => uint256[]) public logsByRecordId;
    mapping(string => uint256[]) public logsByAction;
    
    mapping(address => bool) public trustedContracts;
    
    event LogCreated(
        uint256 indexed logId,
        address indexed actor,
        string action,
        bytes32 indexed recordId,
        uint256 timestamp
    );
    
    event TrustedContractAdded(address indexed contractAddress, uint256 timestamp);
    event TrustedContractRemoved(address indexed contractAddress, uint256 timestamp);
    
    constructor(address _accessControl) {
        require(_accessControl != address(0), "Invalid access control address");
        accessControl = IAccessControl(_accessControl);
    }
    
    modifier onlyAdmin() {
        require(
            accessControl.hasRole(msg.sender, "ADMIN"),
            "Only admin can perform this action"
        );
        _;
    }
    
    modifier onlyTrustedContract() {
        require(
            trustedContracts[msg.sender],
            "Only trusted contracts can log actions"
        );
        _;
    }
    
    function addTrustedContract(address _contract) public onlyAdmin {
        require(_contract != address(0), "Invalid contract address");
        require(!trustedContracts[_contract], "Contract already trusted");
        
        trustedContracts[_contract] = true;
        emit TrustedContractAdded(_contract, block.timestamp);
    }
    
    function removeTrustedContract(address _contract) public onlyAdmin {
        require(trustedContracts[_contract], "Contract not trusted");
        
        trustedContracts[_contract] = false;
        emit TrustedContractRemoved(_contract, block.timestamp);
    }
    
    function logAction(
        address _actor,
        string memory _action,
        bytes32 _recordId,
        uint256 _timestamp
    ) public onlyTrustedContract returns (uint256) {
        return _createLog(_actor, _action, _recordId, _timestamp, "");
    }
    
    function logActionWithMetadata(
        address _actor,
        string memory _action,
        bytes32 _recordId,
        uint256 _timestamp,
        string memory _metadata
    ) public onlyTrustedContract returns (uint256) {
        return _createLog(_actor, _action, _recordId, _timestamp, _metadata);
    }
    
    function _createLog(
        address _actor,
        string memory _action,
        bytes32 _recordId,
        uint256 _timestamp,
        string memory _metadata
    ) internal returns (uint256) {
        require(_actor != address(0), "Invalid actor address");
        require(bytes(_action).length > 0, "Action cannot be empty");
        
        LogEntry memory newLog = LogEntry({
            actor: _actor,
            action: _action,
            recordId: _recordId,
            timestamp: _timestamp,
            metadata: _metadata,
            exists: true
        });
        
        logs.push(newLog);
        uint256 logId = logs.length - 1;
        
        logsByActor[_actor].push(logId);
        logsByRecordId[_recordId].push(logId);
        logsByAction[_action].push(logId);
        
        emit LogCreated(logId, _actor, _action, _recordId, _timestamp);
        
        return logId;
    }
    
    function getLog(uint256 _logId) 
        public 
        view 
        returns (
            address actor,
            string memory action,
            bytes32 recordId,
            uint256 timestamp,
            string memory metadata
        ) 
    {
        require(_logId < logs.length, "Log does not exist");
        LogEntry memory log = logs[_logId];
        return (log.actor, log.action, log.recordId, log.timestamp, log.metadata);
    }
    
    function getLogsByActor(address _actor) public view returns (uint256[] memory) {
        return logsByActor[_actor];
    }
    
    function getLogsByRecordId(bytes32 _recordId) public view returns (uint256[] memory) {
        return logsByRecordId[_recordId];
    }
    
    function getLogsByAction(string memory _action) public view returns (uint256[] memory) {
        return logsByAction[_action];
    }
    
    function getTotalLogs() public view returns (uint256) {
        return logs.length;
    }
    
    function getRecentLogs(uint256 _count) 
        public 
        view 
        returns (LogEntry[] memory) 
    {
        uint256 totalLogs = logs.length;
        uint256 count = _count > totalLogs ? totalLogs : _count;
        
        LogEntry[] memory recentLogs = new LogEntry[](count);
        
        for (uint256 i = 0; i < count; i++) {
            recentLogs[i] = logs[totalLogs - count + i];
        }
        
        return recentLogs;
    }
    
    function getLogsByTimeRange(uint256 _startTime, uint256 _endTime)
        public
        view
        returns (uint256[] memory)
    {
        require(_startTime <= _endTime, "Invalid time range");
        
        uint256[] memory tempResults = new uint256[](logs.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < logs.length; i++) {
            if (logs[i].timestamp >= _startTime && logs[i].timestamp <= _endTime) {
                tempResults[count] = i;
                count++;
            }
        }
        
        uint256[] memory results = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            results[i] = tempResults[i];
        }
        
        return results;
    }
}
