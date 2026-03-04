// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IAccessControl {
    function hasRole(address _account, string memory _roleName) external view returns (bool);
}

interface IAcademicContract {
    function isGradeVerified(bytes32 _studentId, bytes32 _semesterId) external view returns (bool);
    function getGradeDataHash(bytes32 _studentId, bytes32 _semesterId) external view returns (bytes32);
}

interface ILogsManager {
    function logAction(
        address actor, 
        string memory action,
        bytes32 recordId, 
        uint256 timestamp
    ) external;
}

contract VerifierContract {
    IAccessControl public accessControl;
    IAcademicContract public academicContract;
    ILogsManager public logsManager;
    
    struct ScholarshipCriteria {
        string criteriaName;         
        bytes32 criteriaHash;        
        bool isActive;
        uint256 createdAt;
        address createdBy;
    }
    
    struct VerificationResult {
        bytes32 studentId;
        bytes32 criteriaHash;        
        bytes32[] semesterIds;       
        bool isEligible;             
        uint256 verifiedAt;
        bytes32 proofHash;           
        bool exists;
    }
    
    mapping(bytes32 => ScholarshipCriteria) public scholarshipCriteria;
    
    mapping(bytes32 => mapping(bytes32 => VerificationResult)) public verifications;
    
    bytes32[] public allCriteriaIds;
    
    struct VerificationKey {
        bool exists;
        bytes32 keyHash;
    }
    
    mapping(bytes32 => VerificationKey) public verificationKeys;
    
    event CriteriaCreated(
        bytes32 indexed criteriaHash,
        string criteriaName,
        address indexed createdBy,
        uint256 timestamp
    );
    
    event ProofSubmitted(
        bytes32 indexed studentId,
        bytes32 indexed criteriaHash,
        bool isEligible,
        uint256 timestamp
    );
    
    event VerificationKeySet(
        bytes32 indexed criteriaHash,
        bytes32 keyHash,
        uint256 timestamp
    );
    
    constructor(
        address _accessControl,
        address _academicContract,
        address _logsManager
    ) {
        require(_accessControl != address(0), "Invalid access control address");
        require(_academicContract != address(0), "Invalid academic contract address");
        require(_logsManager != address(0), "Invalid logs manager address");
        
        accessControl = IAccessControl(_accessControl);
        academicContract = IAcademicContract(_academicContract);
        logsManager = ILogsManager(_logsManager);
    }
    
    modifier onlyAdmin() {
        require(
            accessControl.hasRole(msg.sender, "ADMIN"),
            "Only admin can perform this action"
        );
        _;
    }
    
    modifier onlyTrainingDept() {
        require(
            accessControl.hasRole(msg.sender, "QLDT"),
            "Only Training Department can perform this action"
        );
        _;
    }
    
    function createScholarshipCriteria(
        string memory _criteriaName,
        bytes32 _criteriaHash
    ) public onlyTrainingDept {
        require(bytes(_criteriaName).length > 0, "Criteria name cannot be empty");
        require(!scholarshipCriteria[_criteriaHash].isActive, "Criteria already exists");
        
        scholarshipCriteria[_criteriaHash] = ScholarshipCriteria({
            criteriaName: _criteriaName,
            criteriaHash: _criteriaHash,
            isActive: true,
            createdAt: block.timestamp,
            createdBy: msg.sender
        });
        
        allCriteriaIds.push(_criteriaHash);
        
        emit CriteriaCreated(_criteriaHash, _criteriaName, msg.sender, block.timestamp);
        
        logsManager.logAction(
            msg.sender,
            "CREATE_SCHOLARSHIP_CRITERIA",
            _criteriaHash,
            block.timestamp
        );
    }
    
    function setVerificationKey(
        bytes32 _criteriaHash,
        bytes32 _keyHash
    ) public onlyTrainingDept {
        require(scholarshipCriteria[_criteriaHash].isActive, "Criteria does not exist");
        
        verificationKeys[_criteriaHash] = VerificationKey({
            exists: true,
            keyHash: _keyHash
        });
        
        emit VerificationKeySet(_criteriaHash, _keyHash, block.timestamp);
    }
    
    function submitProof(
        bytes32 _studentId,
        bytes32 _criteriaHash,
        bytes32[] memory _semesterIds,
        bytes memory _proof,
        bytes32 _proofHash
    ) public returns (bool) {
        require(scholarshipCriteria[_criteriaHash].isActive, "Invalid scholarship criteria");
        require(_semesterIds.length > 0, "Must include at least one semester");
        require(verificationKeys[_criteriaHash].exists, "Verification key not set");
        
        for (uint i = 0; i < _semesterIds.length; i++) {
            require(
                academicContract.isGradeVerified(_studentId, _semesterIds[i]),
                "One or more grades not verified"
            );
        }
        
        bool isEligible = _verifyProof(_criteriaHash, _proof);
        
        verifications[_studentId][_criteriaHash] = VerificationResult({
            studentId: _studentId,
            criteriaHash: _criteriaHash,
            semesterIds: _semesterIds,
            isEligible: isEligible,
            verifiedAt: block.timestamp,
            proofHash: _proofHash,
            exists: true
        });
        
        emit ProofSubmitted(_studentId, _criteriaHash, isEligible, block.timestamp);
        
        bytes32 recordId = keccak256(abi.encodePacked(_studentId, _criteriaHash));
        logsManager.logAction(
            msg.sender,
            "SUBMIT_SCHOLARSHIP_PROOF",
            recordId,
            block.timestamp
        );
        
        return isEligible;
    }
    
    function _verifyProof(bytes32 _criteriaHash, bytes memory _proof) 
        internal 
        view 
        returns (bool) 
    {
        
        require(_proof.length > 0, "Empty proof");
        require(verificationKeys[_criteriaHash].exists, "No verification key");
        
        return true;
    }
    
    function isEligibleForScholarship(
        bytes32 _studentId,
        bytes32 _criteriaHash
    ) public view returns (bool) {
        VerificationResult storage result = verifications[_studentId][_criteriaHash];
        return result.exists && result.isEligible;
    }
    
    function getVerificationResult(
        bytes32 _studentId,
        bytes32 _criteriaHash
    ) public view returns (
        bool isEligible,
        uint256 verifiedAt,
        bytes32[] memory semesterIds,
        bytes32 proofHash
    ) {
        VerificationResult storage result = verifications[_studentId][_criteriaHash];
        require(result.exists, "No verification found");
        
        return (
            result.isEligible,
            result.verifiedAt,
            result.semesterIds,
            result.proofHash
        );
    }
    
    function getAllCriteria() public view returns (bytes32[] memory) {
        return allCriteriaIds;
    }
    
    function deactivateCriteria(bytes32 _criteriaHash) public onlyTrainingDept {
        require(scholarshipCriteria[_criteriaHash].isActive, "Criteria not active");
        scholarshipCriteria[_criteriaHash].isActive = false;
    }
}
