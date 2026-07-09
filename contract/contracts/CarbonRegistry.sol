// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./CarbonCreditToken.sol";

contract CarbonRegistry is AccessControl {
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum ProjectStatus {
        Pending,
        Assigned,
        Verified,
        Rejected,
        NeedMoreInfo
    }

    struct Project {
        uint256 id;
        address owner;
        string metaDataURI;
        string projectType;
        uint256 requestedCredits;
        uint256 approvedCredits;
        address assignedAuditor;
        ProjectStatus status;
        string lastComment;
    }

    uint256 public projectCount;
    CarbonCreditToken public carbonToken;
    mapping(uint256 => Project) public projects;

    event ProjectSubmitted(uint256 indexed projectId, address indexed owner);
    event AuditorAssigned(uint256 indexed projectId, address indexed auditor);
    event ProjectVerified(uint256 indexed projectId, uint256 creditsIssued);
    event ProjectRejected(uint256 indexed projectId, string reason);
    event ProjectNeedMoreInfo(uint256 indexed projectId, string reason);

    constructor(address _carbonToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        carbonToken = CarbonCreditToken(_carbonToken);
    }

    function submitProject(
        string calldata _metaDataURI,
        string calldata _projectType,
        uint256 _requestedCredits
    ) external returns (uint256) {
        return _createProject(msg.sender, _metaDataURI, _projectType, _requestedCredits);
    }

    function submitProjectForOwner(
        address _owner,
        string calldata _metaDataURI,
        string calldata _projectType,
        uint256 _requestedCredits
    ) external onlyRole(ADMIN_ROLE) returns (uint256) {
        require(_owner != address(0), "owner = zero");
        return _createProject(_owner, _metaDataURI, _projectType, _requestedCredits);
    }

    function addAuditor(address _auditor) external onlyRole(ADMIN_ROLE) {
        require(_auditor != address(0), "auditor = zero");
        _grantRole(AUDITOR_ROLE, _auditor);
    }

    function assignAuditor(uint256 _projectId, address _auditor) external onlyRole(ADMIN_ROLE) {
        require(_auditor != address(0), "auditor = zero");
        Project storage p = projects[_projectId];
        require(p.id != 0, "Project not found");
        if (!hasRole(AUDITOR_ROLE, _auditor)) {
            _grantRole(AUDITOR_ROLE, _auditor);
        }
        p.assignedAuditor = _auditor;
        p.status = ProjectStatus.Assigned;
        emit AuditorAssigned(_projectId, _auditor);
    }

    modifier onlyAssignedAuditor(uint256 _projectId) {
        require(projects[_projectId].assignedAuditor == msg.sender, "Not assigned auditor");
        _;
    }

    function verifyProject(uint256 _projectId, uint256 _approvedCredits)
        external
        onlyRole(AUDITOR_ROLE)
        onlyAssignedAuditor(_projectId)
    {
        _verifyProject(_projectId, _approvedCredits);
    }

    function verifyProjectByAdmin(uint256 _projectId, uint256 _approvedCredits) external onlyRole(ADMIN_ROLE) {
        _verifyProject(_projectId, _approvedCredits);
    }

    function rejectProject(uint256 _projectId, string calldata _reason)
        external
        onlyRole(AUDITOR_ROLE)
        onlyAssignedAuditor(_projectId)
    {
        _rejectProject(_projectId, _reason);
    }

    function rejectProjectByAdmin(uint256 _projectId, string calldata _reason) external onlyRole(ADMIN_ROLE) {
        _rejectProject(_projectId, _reason);
    }

    function requestMoreInfo(uint256 _projectId, string calldata _reason)
        external
        onlyRole(AUDITOR_ROLE)
        onlyAssignedAuditor(_projectId)
    {
        Project storage p = projects[_projectId];
        require(p.status == ProjectStatus.Assigned || p.status == ProjectStatus.Pending, "Invalid state");
        p.status = ProjectStatus.NeedMoreInfo;
        p.lastComment = _reason;
        emit ProjectNeedMoreInfo(_projectId, _reason);
    }

    function requestMoreInfoByAdmin(uint256 _projectId, string calldata _reason) external onlyRole(ADMIN_ROLE) {
        Project storage p = projects[_projectId];
        require(p.id != 0, "Project not found");
        p.status = ProjectStatus.NeedMoreInfo;
        p.lastComment = _reason;
        emit ProjectNeedMoreInfo(_projectId, _reason);
    }

    function getProject(uint256 _projectId) external view returns (Project memory) {
        return projects[_projectId];
    }

    function _createProject(
        address _owner,
        string calldata _metaDataURI,
        string calldata _projectType,
        uint256 _requestedCredits
    ) internal returns (uint256) {
        require(_requestedCredits > 0, "Credits must be > 0");
        projectCount++;
        uint256 newId = projectCount;
        projects[newId] = Project({
            id: newId,
            owner: _owner,
            metaDataURI: _metaDataURI,
            projectType: _projectType,
            requestedCredits: _requestedCredits,
            approvedCredits: 0,
            assignedAuditor: address(0),
            status: ProjectStatus.Pending,
            lastComment: ""
        });
        emit ProjectSubmitted(newId, _owner);
        return newId;
    }

    function _verifyProject(uint256 _projectId, uint256 _approvedCredits) internal {
        Project storage p = projects[_projectId];
        require(p.id != 0, "Project not found");
        require(p.status == ProjectStatus.Assigned || p.status == ProjectStatus.NeedMoreInfo, "Not in review state");
        require(_approvedCredits > 0, "Credits must be > 0");
        require(_approvedCredits <= p.requestedCredits, "Too many credits");
        p.approvedCredits = _approvedCredits;
        p.status = ProjectStatus.Verified;
        carbonToken.mint(p.owner, _projectId, _approvedCredits, "");
        emit ProjectVerified(_projectId, _approvedCredits);
    }

    function _rejectProject(uint256 _projectId, string calldata _reason) internal {
        Project storage p = projects[_projectId];
        require(p.id != 0, "Project not found");
        require(p.status == ProjectStatus.Assigned || p.status == ProjectStatus.NeedMoreInfo, "Not in review state");
        p.status = ProjectStatus.Rejected;
        p.lastComment = _reason;
        emit ProjectRejected(_projectId, _reason);
    }
}
