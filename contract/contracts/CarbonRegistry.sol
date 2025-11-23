// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./CarbonCreditToken.sol";

/**
 * @title CarbonRegistry
 * @dev Handles project registration, auditor verification, and credit issuance.
 */
contract CarbonRegistry is AccessControl {
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant ADMIN_ROLE   = keccak256("ADMIN_ROLE");

    enum ProjectStatus {
        Pending,
        Assigned,
        Verified,
        Rejected,
        NeedMoreInfo
    }

    struct Project {
        uint256 id;
        address owner;        // project owner (user)
        string  metaDataURI;  // IPFS hash or URL to PDD/evidence
        string  projectType;  // "Solar", "Wind", "Afforestation", etc.
        uint256 requestedCredits;
        uint256 approvedCredits;
        address assignedAuditor;
        ProjectStatus status;
        string lastComment;   // reason for rejection / more info
    }

    uint256 public projectCount;
    CarbonCreditToken public carbonToken;

    // projectId => Project
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

    // =========================
    //  USER FUNCTIONS
    // =========================

    /**
     * @notice User submits a new project for verification.
     * @param _metaDataURI IPFS hash / URL of PDD + docs
     * @param _projectType Type of project ("Solar", "Wind", "Forest", etc.)
     * @param _requestedCredits How many credits they claim
     */
    function submitProject(
        string calldata _metaDataURI,
        string calldata _projectType,
        uint256 _requestedCredits
    ) external returns (uint256) {
        require(_requestedCredits > 0, "Credits must be > 0");

        projectCount++;
        uint256 newId = projectCount;

        projects[newId] = Project({
            id: newId,
            owner: msg.sender,
            metaDataURI: _metaDataURI,
            projectType: _projectType,
            requestedCredits: _requestedCredits,
            approvedCredits: 0,
            assignedAuditor: address(0),
            status: ProjectStatus.Pending,
            lastComment: ""
        });

        emit ProjectSubmitted(newId, msg.sender);
        return newId;
    }

    // =========================
    //  ADMIN FUNCTIONS
    // =========================

    /// @notice Admin adds an auditor account
    function addAuditor(address _auditor) external onlyRole(ADMIN_ROLE) {
        _grantRole(AUDITOR_ROLE, _auditor);
    }

    /// @notice Admin assigns an auditor to a project (simulating "hire auditor" / mapping)
    function assignAuditor(uint256 _projectId, address _auditor)
        external
        onlyRole(ADMIN_ROLE)
    {
        Project storage p = projects[_projectId];
        require(p.id != 0, "Project not found");
        require(hasRole(AUDITOR_ROLE, _auditor), "Not an auditor");

        p.assignedAuditor = _auditor;
        p.status = ProjectStatus.Assigned;

        emit AuditorAssigned(_projectId, _auditor);
    }

    // =========================
    //  AUDITOR FUNCTIONS
    // =========================

    modifier onlyAssignedAuditor(uint256 _projectId) {
        require(
            projects[_projectId].assignedAuditor == msg.sender,
            "Not assigned auditor"
        );
        _;
    }

    /**
     * @notice Auditor verifies the project and decides how many credits to approve.
     * @param _projectId ID of the project
     * @param _approvedCredits Credits to mint and award to owner
     */
    function verifyProject(uint256 _projectId, uint256 _approvedCredits)
        external
        onlyRole(AUDITOR_ROLE)
        onlyAssignedAuditor(_projectId)
    {
        Project storage p = projects[_projectId];
        require(p.status == ProjectStatus.Assigned, "Not in Assigned state");
        require(_approvedCredits > 0, "Credits must be > 0");
        require(_approvedCredits <= p.requestedCredits, "Too many credits");

        p.approvedCredits = _approvedCredits;
        p.status = ProjectStatus.Verified;

        // Mint credits: tokenId = projectId, amount = approvedCredits
        carbonToken.mint(p.owner, _projectId, _approvedCredits, "");

        emit ProjectVerified(_projectId, _approvedCredits);
    }

    /**
     * @notice Auditor rejects a project completely (no credits issued).
     */
    function rejectProject(uint256 _projectId, string calldata _reason)
        external
        onlyRole(AUDITOR_ROLE)
        onlyAssignedAuditor(_projectId)
    {
        Project storage p = projects[_projectId];
        require(
            p.status == ProjectStatus.Assigned || p.status == ProjectStatus.NeedMoreInfo,
            "Not in review state"
        );

        p.status = ProjectStatus.Rejected;
        p.lastComment = _reason;

        emit ProjectRejected(_projectId, _reason);
    }

    /**
     * @notice Auditor requests more info / documents from user.
     */
    function requestMoreInfo(uint256 _projectId, string calldata _reason)
        external
        onlyRole(AUDITOR_ROLE)
        onlyAssignedAuditor(_projectId)
    {
        Project storage p = projects[_projectId];
        require(
            p.status == ProjectStatus.Assigned || p.status == ProjectStatus.Pending,
            "Invalid state"
        );

        p.status = ProjectStatus.NeedMoreInfo;
        p.lastComment = _reason;

        emit ProjectNeedMoreInfo(_projectId, _reason);
    }

    // =========================
    //  VIEW HELPERS
    // =========================

    function getProject(uint256 _projectId)
        external
        view
        returns (Project memory)
    {
        return projects[_projectId];
    }
}
