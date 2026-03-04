// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IAccessControl {
    function hasRole(address _account, string memory _roleName) external view returns (bool);
}

interface ILogsManager {
    function logAction(
        address actor,
        string memory action,
        bytes32 recordId,
        uint256 timestamp
    ) external;
}

contract ProfileContract {
    
    bytes32 public constant QLDT = keccak256("QLDT");
    bytes32 public constant SINH_VIEN = keccak256("SINH_VIEN");
    
    IAccessControl public accessControl;
    ILogsManager public logsManager;
    
    struct StudentProfile {
        bytes32 studentId;
        string ipfsHash;
        bytes32 dataHash;
        bytes signature;
        string[] encryptedKeys;
        address[] authorizedParties;
        uint256 createdAt;
        uint256 lastUpdatedAt;
        bool isLocked;
        bool exists;
    }
    
    mapping(bytes32 => StudentProfile) public profiles;
    mapping(bytes32 => uint256) public editDeadline;
    
    event ProfileCreated(
        bytes32 indexed studentId,
        string ipfsHash,
        bytes32 dataHash,
        uint256 timestamp
    );
    
    event ProfileUpdated(
        bytes32 indexed studentId,
        string ipfsHash,
        bytes32 dataHash,
        uint256 timestamp
    );
    
    event ProfileLocked(
        bytes32 indexed studentId,
        uint256 timestamp
    );
    
    event KeysUpdated(
        bytes32 indexed studentId,
        uint256 keyCount,
        uint256 timestamp
    );
    
    constructor(address _accessControl, address _logsManager) {
        require(_accessControl != address(0), "Invalid access control address");
        require(_logsManager != address(0), "Invalid logs manager address");
        accessControl = IAccessControl(_accessControl);
        logsManager = ILogsManager(_logsManager);
    }
    
    modifier onlyTrainingDept() {
        require(
            accessControl.hasRole(msg.sender, "QLDT"),
            "Only Training Department can perform this action"
        );
        _;
    }
    
    modifier onlyAuthorized(bytes32 _studentId) {
        bool isAuthorized = false;
        StudentProfile storage profile = profiles[_studentId];
        
        for (uint i = 0; i < profile.authorizedParties.length; i++) {
            if (profile.authorizedParties[i] == msg.sender) {
                isAuthorized = true;
                break;
            }
        }
        
        require(isAuthorized, "Not authorized to access this profile");
        _;
    }
    
    function createProfile(
        bytes32 _studentId,
        string memory _ipfsHash,
        bytes32 _dataHash,
        bytes memory _signature,
        string[] memory _encryptedKeys,
        address[] memory _authorizedParties,
        uint256 _editPeriodDays
    ) public onlyTrainingDept {
        require(!profiles[_studentId].exists, "Profile already exists");
        require(_encryptedKeys.length == _authorizedParties.length, "Keys and parties mismatch");
        require(_authorizedParties.length > 0, "Must have at least one authorized party");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        require(verifySignature(_dataHash, _signature, msg.sender), "Invalid signature");
        
        profiles[_studentId] = StudentProfile({
            studentId: _studentId,
            ipfsHash: _ipfsHash,
            dataHash: _dataHash,
            signature: _signature,
            encryptedKeys: _encryptedKeys,
            authorizedParties: _authorizedParties,
            createdAt: block.timestamp,
            lastUpdatedAt: block.timestamp,
            isLocked: false,
            exists: true
        });
        
        editDeadline[_studentId] = block.timestamp + (_editPeriodDays * 1 days);
        
        emit ProfileCreated(_studentId, _ipfsHash, _dataHash, block.timestamp);
        
        logsManager.logAction(
            msg.sender,
            "CREATE_PROFILE",
            _studentId,
            block.timestamp
        );
    }
    
    function updateProfile(
        bytes32 _studentId,
        string memory _ipfsHash,
        bytes32 _dataHash,
        bytes memory _signature,
        string[] memory _encryptedKeys
    ) public onlyAuthorized(_studentId) {
        StudentProfile storage profile = profiles[_studentId];
        
        require(profile.exists, "Profile does not exist");
        require(!profile.isLocked, "Profile is locked");
        require(block.timestamp <= editDeadline[_studentId], "Edit period expired");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(_encryptedKeys.length == profile.authorizedParties.length, "Keys count mismatch");
        
        require(verifySignature(_dataHash, _signature, msg.sender), "Invalid signature");
        
        profile.ipfsHash = _ipfsHash;
        profile.dataHash = _dataHash;
        profile.signature = _signature;
        profile.encryptedKeys = _encryptedKeys;
        profile.lastUpdatedAt = block.timestamp;
        
        emit ProfileUpdated(_studentId, _ipfsHash, _dataHash, block.timestamp);
        
        logsManager.logAction(
            msg.sender,
            "UPDATE_PROFILE",
            _studentId,
            block.timestamp
        );
    }
    
    function lockProfile(bytes32 _studentId) public {
        StudentProfile storage profile = profiles[_studentId];
        
        require(profile.exists, "Profile does not exist");
        require(!profile.isLocked, "Profile already locked");
        
        bool canLock = accessControl.hasRole(msg.sender, "QLDT") ||
                       block.timestamp > editDeadline[_studentId];
        
        require(canLock, "Cannot lock profile yet");
        
        profile.isLocked = true;
        
        emit ProfileLocked(_studentId, block.timestamp);
        
        logsManager.logAction(
            msg.sender,
            "LOCK_PROFILE",
            _studentId,
            block.timestamp
        );
    }
    
    function getProfile(bytes32 _studentId) 
        public 
        view 
        onlyAuthorized(_studentId) 
        returns (
            string memory ipfsHash,
            bytes32 dataHash,
            string[] memory encryptedKeys,
            uint256 createdAt,
            uint256 lastUpdatedAt,
            bool isLocked
        ) 
    {
        StudentProfile storage profile = profiles[_studentId];
        require(profile.exists, "Profile does not exist");
        
        return (
            profile.ipfsHash,
            profile.dataHash,
            profile.encryptedKeys,
            profile.createdAt,
            profile.lastUpdatedAt,
            profile.isLocked
        );
    }
    
    function profileExists(bytes32 _studentId) public view returns (bool) {
        return profiles[_studentId].exists;
    }
    
    function verifySignature(
        bytes32 _messageHash,
        bytes memory _signature,
        address _expectedSigner
    ) public pure returns (bool) {
        bytes32 ethSignedHash = getEthSignedMessageHash(_messageHash);
        address recoveredSigner = recoverSigner(ethSignedHash, _signature);
        return recoveredSigner == _expectedSigner;
    }
    
    function getEthSignedMessageHash(bytes32 _messageHash) 
        public 
        pure 
        returns (bytes32) 
    {
        return keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash)
        );
    }
    
    function recoverSigner(bytes32 _ethSignedHash, bytes memory _signature)
        public
        pure
        returns (address)
    {
        require(_signature.length == 65, "Invalid signature length");
        
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        assembly {
            r := mload(add(_signature, 32))
            s := mload(add(_signature, 64))
            v := byte(0, mload(add(_signature, 96)))
        }
        
        return ecrecover(_ethSignedHash, v, r, s);
    }
}
