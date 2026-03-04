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

interface IProfileContract {
    function profileExists(bytes32 _studentId) external view returns (bool);
}

contract AcademicContract {
    IAccessControl public accessControl;
    ILogsManager public logsManager;
    IProfileContract public profileContract;
    
    struct GradeRecord {
        bytes32 studentId;
        bytes32 semesterId;
        string ipfsHash;
        bytes32 dataHash;
        bytes signature;
        string[] encryptedKeys;
        address[] authorizedParties;
        address submittedBy;
        address verifiedBy;
        uint256 createdAt;
        uint256 lastUpdatedAt;
        uint256 verifiedAt;
        bool isLocked;
        bool isVerified;
        bool exists;
    }
    
    mapping(bytes32 => mapping(bytes32 => GradeRecord)) public gradeRecords;
    mapping(bytes32 => mapping(bytes32 => uint256)) public correctionDeadline;
    
    event GradeSubmitted(
        bytes32 indexed studentId,
        bytes32 indexed semesterId,
        address indexed submittedBy,
        string ipfsHash,
        uint256 timestamp
    );

    event GradeUpdated(
        bytes32 indexed studentId,
        bytes32 indexed semesterId,
        address indexed updatedBy,
        uint256 timestamp
    );
    
    event GradeVerified(
        bytes32 indexed studentId,
        bytes32 indexed semesterId,
        address indexed verifier,
        uint256 timestamp
    );
    
    event GradeLocked(
        bytes32 indexed studentId,
        bytes32 indexed semesterId,
        uint256 timestamp
    );
    
    constructor(
        address _accessControl,
        address _logsManager,
        address _profileContract
    ) {
        require(_accessControl != address(0), "Invalid access control address");
        require(_logsManager != address(0), "Invalid logs manager address");
        require(_profileContract != address(0), "Invalid profile contract address");
        
        accessControl = IAccessControl(_accessControl);
        logsManager = ILogsManager(_logsManager);
        profileContract = IProfileContract(_profileContract);
    }
    
    modifier onlyQLKT() {
        require(
            accessControl.hasRole(msg.sender, "QLKT"),
            "Only Examination Dept (QLKT) can perform this action"
        );
        _;
    }

    modifier onlyExaminationDeptOrFaculty() {
        bool isAuthorized = accessControl.hasRole(msg.sender, "QLKT") ||
                           accessControl.hasRole(msg.sender, "KHOA");
        require(isAuthorized, "Only Examination Dept or Faculty can perform this action");
        _;
    }
    
    modifier onlyAuthorized(bytes32 _studentId, bytes32 _semesterId) {
        bool isAuthorized = false;
        GradeRecord storage record = gradeRecords[_studentId][_semesterId];
        
        for (uint i = 0; i < record.authorizedParties.length; i++) {
            if (record.authorizedParties[i] == msg.sender) {
                isAuthorized = true;
                break;
            }
        }
        
        require(isAuthorized, "Not authorized to access this grade record");
        _;
    }
    
    function submitGrade(
        bytes32 _studentId,
        bytes32 _semesterId,
        string memory _ipfsHash,
        bytes32 _dataHash,
        bytes memory _signature,
        string[] memory _encryptedKeys,
        address[] memory _authorizedParties,
        uint256 _correctionPeriodDays
    ) public onlyQLKT {
        require(
            profileContract.profileExists(_studentId),
            "Student profile does not exist"
        );
        require(
            !gradeRecords[_studentId][_semesterId].exists,
            "Grade record already exists"
        );
        require(_encryptedKeys.length == _authorizedParties.length, "Keys and parties mismatch");
        require(_authorizedParties.length > 0, "Must have authorized parties");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        require(verifySignature(_dataHash, _signature, msg.sender), "Invalid signature");
        
        gradeRecords[_studentId][_semesterId] = GradeRecord({
            studentId: _studentId,
            semesterId: _semesterId,
            ipfsHash: _ipfsHash,
            dataHash: _dataHash,
            signature: _signature,
            encryptedKeys: _encryptedKeys,
            authorizedParties: _authorizedParties,
            submittedBy: msg.sender,
            verifiedBy: address(0),
            createdAt: block.timestamp,
            lastUpdatedAt: block.timestamp,
            verifiedAt: 0,
            isLocked: false,
            isVerified: false,
            exists: true
        });
        
        correctionDeadline[_studentId][_semesterId] = 
            block.timestamp + (_correctionPeriodDays * 1 days);
        
        emit GradeSubmitted(_studentId, _semesterId, msg.sender, _ipfsHash, block.timestamp);
        
        bytes32 recordId = keccak256(abi.encodePacked(_studentId, _semesterId));
        logsManager.logAction(
            msg.sender,
            "SUBMIT_GRADE",
            recordId,
            block.timestamp
        );
    }
    
    function updateGrade(
        bytes32 _studentId,
        bytes32 _semesterId,
        string memory _ipfsHash,
        bytes32 _dataHash,
        bytes memory _signature,
        string[] memory _encryptedKeys
    ) public onlyQLKT {
        GradeRecord storage record = gradeRecords[_studentId][_semesterId];
        
        require(record.exists, "Grade record does not exist");
        require(record.submittedBy == msg.sender, "Not the original submitter");
        require(!record.isLocked, "Grade record is locked");
        require(
            block.timestamp <= correctionDeadline[_studentId][_semesterId],
            "Correction period expired"
        );
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(_encryptedKeys.length == record.authorizedParties.length, "Keys count mismatch");
        
        require(verifySignature(_dataHash, _signature, msg.sender), "Invalid signature");
        
        record.ipfsHash = _ipfsHash;
        record.dataHash = _dataHash;
        record.signature = _signature;
        record.encryptedKeys = _encryptedKeys;
        record.lastUpdatedAt = block.timestamp;
        
        emit GradeUpdated(_studentId, _semesterId, msg.sender, block.timestamp);
        
        bytes32 recordId = keccak256(abi.encodePacked(_studentId, _semesterId));
        logsManager.logAction(
            msg.sender,
            "UPDATE_GRADE",
            recordId,
            block.timestamp
        );
    }
    
    function verifyAndLockGrade(
        bytes32 _studentId,
        bytes32 _semesterId,
        bytes memory _departmentSignature
    ) public onlyExaminationDeptOrFaculty {
        GradeRecord storage record = gradeRecords[_studentId][_semesterId];
        
        require(record.exists, "Grade record does not exist");
        require(!record.isVerified, "Already verified");
        require(
            block.timestamp > correctionDeadline[_studentId][_semesterId],
            "Correction period not expired yet"
        );
        
        require(
            verifySignature(record.dataHash, _departmentSignature, msg.sender),
            "Invalid department signature"
        );
        
        record.isVerified = true;
        record.isLocked = true;
        record.verifiedBy = msg.sender;
        record.verifiedAt = block.timestamp;
        
        emit GradeVerified(_studentId, _semesterId, msg.sender, block.timestamp);
        emit GradeLocked(_studentId, _semesterId, block.timestamp);
        
        bytes32 recordId = keccak256(abi.encodePacked(_studentId, _semesterId));
        logsManager.logAction(
            msg.sender,
            "VERIFY_GRADE",
            recordId,
            block.timestamp
        );
    }
    
    function getGradeRecord(bytes32 _studentId, bytes32 _semesterId)
        public
        view
        onlyAuthorized(_studentId, _semesterId)
        returns (
            string memory ipfsHash,
            bytes32 dataHash,
            string[] memory encryptedKeys,
            address submittedBy,
            address verifiedBy,
            uint256 createdAt,
            bool isVerified,
            bool isLocked
        )
    {
        GradeRecord storage record = gradeRecords[_studentId][_semesterId];
        require(record.exists, "Grade record does not exist");
        
        return (
            record.ipfsHash,
            record.dataHash,
            record.encryptedKeys,
            record.submittedBy,
            record.verifiedBy,
            record.createdAt,
            record.isVerified,
            record.isLocked
        );
    }
    
    function isGradeVerified(bytes32 _studentId, bytes32 _semesterId)
        public
        view
        returns (bool)
    {
        GradeRecord storage record = gradeRecords[_studentId][_semesterId];
        return record.exists && record.isVerified && record.isLocked;
    }
    
    function getGradeDataHash(bytes32 _studentId, bytes32 _semesterId)
        public
        view
        returns (bytes32)
    {
        require(gradeRecords[_studentId][_semesterId].exists, "Grade record does not exist");
        return gradeRecords[_studentId][_semesterId].dataHash;
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
