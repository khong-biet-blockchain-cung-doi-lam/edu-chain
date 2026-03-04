// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract AccessControlContract { 
    bytes32 public constant ADMIN = keccak256("ADMIN"); 
    bytes32 public constant QLDT = keccak256("QLDT");
    bytes32 public constant QLKT = keccak256("QLKT");
    bytes32 public constant GIANG_VIEN = keccak256("GIANG_VIEN");
    bytes32 public constant KHOA = keccak256("KHOA");
    bytes32 public constant SINH_VIEN = keccak256("SINH_VIEN");
    
    struct RoleData { 
        bytes32 roleHash; 
        string roleName;
        uint256 grantedAt;
        address grantedBy;
        bool isActive;
        bool exists;
    }

    mapping(address => RoleData) public userRoles;
    
    address[] private allUsers;
    mapping(address => bool) private userExists; 
    
    event RoleGranted(
        address indexed account,
        string roleName,
        address indexed grantedBy,
        uint256 timestamp
    );
    
    event RoleRevoked(
        address indexed account,
        string roleName,
        address indexed revokedBy,
        uint256 timestamp
    );
    
    event StatusChanged(
        address indexed account,
        bool isActive,
        address indexed changedBy,
        uint256 timestamp
    );
    
    constructor() { 
        userRoles[msg.sender] = RoleData({
            roleHash: ADMIN,
            roleName: "ADMIN",
            grantedAt: block.timestamp,
            grantedBy: msg.sender,
            isActive: true,
            exists: true
        });
        
        allUsers.push(msg.sender);
        userExists[msg.sender] = true;
        
        emit RoleGranted(msg.sender, "ADMIN", msg.sender, block.timestamp);
    }
    
    modifier onlyAdmin() { 
        require(userRoles[msg.sender].roleHash == ADMIN, "Nguoi goi khong phai la admin");
        require(userRoles[msg.sender].isActive, "Tai khoan admin khong hoat dong");
        _; 
    }
    
    modifier onlyActiveRole() {
        require(userRoles[msg.sender].exists, "Chua duoc trao vai tro");
        require(userRoles[msg.sender].isActive, "Tai khoan khong hoat dong");
        _;
    }
    
    function grantRole(address _account, string memory _roleName) public onlyAdmin {
        require(_account != address(0), "Khong the trao quyen dia chi 0");
        require(bytes(_roleName).length > 0, "Role khong the trong");
        
        if (userRoles[_account].exists && userRoles[_account].isActive) {
            require(
                keccak256(abi.encodePacked(userRoles[_account].roleName)) == 
                keccak256(abi.encodePacked(_roleName)),
                "Tai khoan da co role"
            );
            revert("Tai khoan da co role nay");
        }
        
        bytes32 roleHash = keccak256(abi.encodePacked(_roleName));
        
        userRoles[_account] = RoleData({
            roleHash: roleHash,
            roleName: _roleName,
            grantedAt: block.timestamp,
            grantedBy: msg.sender,
            isActive: true,
            exists: true
        });
        
        if (!userExists[_account]) {
            allUsers.push(_account);
            userExists[_account] = true;
        }
        
        emit RoleGranted(_account, _roleName, msg.sender, block.timestamp);
    }
    
    function revokeRole(address _account) public onlyAdmin {
        require(_account != msg.sender, "Cannot revoke own role");
        require(userRoles[_account].exists, "No role to revoke");
        
        string memory roleName = userRoles[_account].roleName;
        
        delete userRoles[_account];
        
        emit RoleRevoked(_account, roleName, msg.sender, block.timestamp);
    }
    
    function setStatus(address _account, bool _isActive) public onlyAdmin {
        require(_account != msg.sender, "Cannot change own status");
        require(userRoles[_account].exists, "Account has no role");
        require(userRoles[_account].isActive != _isActive, "Status already set");
        
        userRoles[_account].isActive = _isActive;
        
        emit StatusChanged(_account, _isActive, msg.sender, block.timestamp);
    }
    
    function hasRole(address _account, string memory _roleName) public view returns (bool) {
        if (!userRoles[_account].exists || !userRoles[_account].isActive) {
            return false;
        }
        
        bytes32 roleHash = keccak256(abi.encodePacked(_roleName));
        return userRoles[_account].roleHash == roleHash;
    }
    
    function getRoleData(address _account) 
        public 
        view 
        returns (
            string memory roleName,
            uint256 grantedAt,
            address grantedBy,
            bool isActive,
            bool exists
        ) 
    {
        RoleData memory data = userRoles[_account];
        return (data.roleName, data.grantedAt, data.grantedBy, data.isActive, data.exists);
    }
    
    function getUserCount() public view returns (uint256) {
        return allUsers.length;
    }
    
    function getUserByIndex(uint256 _index) public view returns (address) {
        require(_index < allUsers.length, "Index out of bounds");
        return allUsers[_index];
    }
    
    function isAdmin(address _account) public view returns (bool) {
        return userRoles[_account].roleHash == ADMIN && 
               userRoles[_account].isActive && 
               userRoles[_account].exists;
    }
}
