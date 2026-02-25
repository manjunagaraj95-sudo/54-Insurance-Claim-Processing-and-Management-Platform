
import React, { useState, useEffect } from 'react';

// --- Constants ---

const ROLES = {
  POLICYHOLDER: 'POLICYHOLDER',
  CLAIMS_OFFICER: 'CLAIMS_OFFICER',
  VERIFICATION_OFFICER: 'VERIFICATION_OFFICER',
  FINANCE_TEAM: 'FINANCE_TEAM',
  ADMIN: 'ADMIN',
};

const STATUS_MAP = {
  SUBMITTED: { label: 'Submitted', colorClass: 'status-submitted' },
  IN_REVIEW: { label: 'In Review', colorClass: 'status-in-review' },
  VERIFIED: { label: 'Verified', colorClass: 'status-verified' },
  APPROVED: { label: 'Approved', colorClass: 'status-approved' },
  REJECTED: { label: 'Rejected', colorClass: 'status-rejected' },
  SETTLED: { label: 'Settled', colorClass: 'status-settled' },
  PENDING_DOCS: { label: 'Pending Documents', colorClass: 'status-pending' },
  SLA_BREACHED: { label: 'SLA Breached', colorClass: 'status-breached' },
};

const VIEWS = {
  LOGIN: 'LOGIN',
  DASHBOARD: 'DASHBOARD',
  CLAIMS_LIST: 'CLAIMS_LIST',
  CLAIM_DETAIL: 'CLAIM_DETAIL',
  POLICIES_LIST: 'POLICIES_LIST',
  POLICY_DETAIL: 'POLICY_DETAIL', // Not explicitly requested but good for consistency
  USERS_LIST: 'USERS_LIST',
  USER_DETAIL: 'USER_DETAIL', // Not explicitly requested
  ACTIVITY_LOGS: 'ACTIVITY_LOGS',
  SUBMIT_CLAIM_FORM: 'SUBMIT_CLAIM_FORM',
  EDIT_CLAIM_FORM: 'EDIT_CLAIM_FORM',
};

// --- Dummy Data Generation ---

const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateUsers = () => {
  const users = [
    { id: 'usr-1', name: 'Alice Smith', email: 'alice.s@example.com', role: ROLES.POLICYHOLDER },
    { id: 'usr-2', name: 'Bob Johnson', email: 'bob.j@example.com', role: ROLES.CLAIMS_OFFICER },
    { id: 'usr-3', name: 'Charlie Brown', email: 'charlie.b@example.com', role: ROLES.VERIFICATION_OFFICER },
    { id: 'usr-4', name: 'Diana Prince', email: 'diana.p@example.com', role: ROLES.FINANCE_TEAM },
    { id: 'usr-5', name: 'Eve Adams', email: 'eve.a@example.com', role: ROLES.ADMIN },
    { id: 'usr-6', name: 'Frank White', email: 'frank.w@example.com', role: ROLES.POLICYHOLDER },
    { id: 'usr-7', name: 'Grace Lee', email: 'grace.l@example.com', role: ROLES.CLAIMS_OFFICER },
  ];
  return users;
};

const generatePolicies = (users) => {
  const policyholders = users.filter(u => u.role === ROLES.POLICYHOLDER);
  const policies = [];
  for (let i = 1; i <= 10; i++) {
    const policyholder = getRandomElement(policyholders);
    policies.push({
      id: `pol-${i}`,
      policyNumber: `POL-${1000 + i}`,
      policyholderId: policyholder?.id,
      policyholderName: policyholder?.name,
      type: getRandomElement(['Auto', 'Home', 'Life', 'Health']),
      startDate: getRandomDate(new Date(2020, 0, 1), new Date(2022, 11, 31)).toISOString().split('T')[0],
      endDate: getRandomDate(new Date(2023, 0, 1), new Date(2025, 11, 31)).toISOString().split('T')[0],
      coverageAmount: getRandomInt(50000, 500000).toLocaleString('en-US'),
    });
  }
  return policies;
};

const generateClaims = (policies, users) => {
  const claims = [];
  const claimStatuses = Object.keys(STATUS_MAP);
  for (let i = 1; i <= 15; i++) { // More claims to show variety
    const policy = getRandomElement(policies);
    const status = getRandomElement(claimStatuses);
    const submissionDate = getRandomDate(new Date(2023, 0, 1), new Date()).toISOString().split('T')[0];
    const slaDueDate = new Date(new Date(submissionDate).getTime() + getRandomInt(5, 20) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 5-20 days later
    const isSlaBreached = new Date(slaDueDate) < new Date() && status !== 'SETTLED' && status !== 'REJECTED';
    
    const claim = {
      id: `clm-${i}`,
      policyId: policy?.id,
      policyNumber: policy?.policyNumber,
      policyholderId: policy?.policyholderId,
      policyholderName: policy?.policyholderName,
      claimNumber: `CLM-${10000 + i}`,
      submissionDate: submissionDate,
      incidentDate: getRandomDate(new Date(policy?.startDate), new Date(submissionDate)).toISOString().split('T')[0],
      status: isSlaBreached ? STATUS_MAP.SLA_BREACHED.label : status, // Override status if SLA breached
      amountRequested: getRandomInt(1000, 50000),
      amountSettled: status === 'SETTLED' ? getRandomInt(800, 45000) : null,
      documents: [
        { id: `doc-${i}-1`, name: 'Police Report.pdf', url: '#', type: 'pdf' },
        { id: `doc-${i}-2`, name: 'Damages Estimate.jpeg', url: '#', type: 'image' },
      ],
      notes: `Initial claim submitted for incident on ${policy?.policyNumber}.`,
      currentWorkflowStage: isSlaBreached ? 'SLA Review' : (status === 'SUBMITTED' ? 'Initial Review' : status),
      slaDueDate: slaDueDate,
      auditLog: [], // Will populate below
    };

    claim.auditLog = [
      { id: `log-${i}-1`, timestamp: getRandomDate(new Date(submissionDate), new Date()).toISOString(), userId: getRandomElement(users).id, userName: getRandomElement(users).name, action: 'Claim Submitted', details: `Claim ${claim.claimNumber} submitted by policyholder.` },
    ];
    if (status !== 'SUBMITTED') {
      claim.auditLog.push({ id: `log-${i}-2`, timestamp: getRandomDate(new Date(submissionDate), new Date()).toISOString(), userId: users.find(u => u.role === ROLES.CLAIMS_OFFICER)?.id, userName: users.find(u => u.role === ROLES.CLAIMS_OFFICER)?.name, action: `Status Changed to ${status}`, details: `Claim ${claim.claimNumber} moved to ${status}.` });
    }
    claims.push(claim);
  }
  return claims;
};

const generateActivityLog = (users, claims) => {
  const activities = [];
  for (let i = 0; i < 20; i++) {
    const user = getRandomElement(users);
    const claim = getRandomElement(claims);
    const actions = ['Claim Submitted', 'Claim Reviewed', 'Claim Approved', 'Document Uploaded', 'User Logged In', 'Policy Created'];
    const action = getRandomElement(actions);
    const details = `${user?.name} performed ${action} on ${claim ? `claim ${claim?.claimNumber}` : 'system'}.`;
    activities.push({
      id: `act-${i}`,
      timestamp: getRandomDate(new Date(2023, 0, 1), new Date()).toLocaleString(),
      userId: user?.id,
      userName: user?.name,
      action: action,
      entityType: claim ? 'Claim' : 'System',
      entityId: claim?.id,
      details: details,
    });
  }
  return activities;
};

const getInitialData = () => {
  const users = generateUsers();
  const policies = generatePolicies(users);
  const claims = generateClaims(policies, users);
  const activityLog = generateActivityLog(users, claims);
  return { users, policies, claims, activityLog };
};

// --- Main App Component ---

const App = () => {
  const [view, setView] = useState({ screen: VIEWS.LOGIN, params: {} });
  const [currentUser, setCurrentUser] = useState(null);
  const [data, setData] = useState(getInitialData());

  // Simulate real-time updates / live refresh with subtle pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        const updatedClaims = prevData.claims.map(claim => {
          if (Math.random() < 0.2) { // 20% chance to update a claim's status or mark as 'pulsing'
            const statuses = Object.keys(STATUS_MAP).filter(s => s !== 'SLA_BREACHED'); // Don't randomly set SLA Breached
            const newStatus = getRandomElement(statuses);
            const isSlaBreached = new Date(claim.slaDueDate) < new Date() && newStatus !== 'SETTLED' && newStatus !== 'REJECTED';
            return {
              ...claim,
              status: isSlaBreached ? STATUS_MAP.SLA_BREACHED.label : newStatus,
              // Add a temporary flag for animation
              isPulsing: true,
              amountRequested: claim.amountRequested + getRandomInt(-100, 100), // Minor value change
            };
          }
          return { ...claim, isPulsing: false }; // Reset pulsing flag
        });
        return { ...prevData, claims: updatedClaims };
      });
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const navigate = (screen, params = {}) => {
    setView({ screen, params });
  };

  const handleLogin = (role) => {
    const user = data.users.find(u => u.role === role);
    setCurrentUser(user);
    navigate(VIEWS.DASHBOARD);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate(VIEWS.LOGIN);
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [{ label: 'Home', screen: VIEWS.DASHBOARD }];
    switch (view.screen) {
      case VIEWS.DASHBOARD:
        return breadcrumbs;
      case VIEWS.CLAIMS_LIST:
        breadcrumbs.push({ label: 'Claims', screen: VIEWS.CLAIMS_LIST });
        break;
      case VIEWS.CLAIM_DETAIL:
        breadcrumbs.push({ label: 'Claims', screen: VIEWS.CLAIMS_LIST });
        breadcrumbs.push({ label: `Claim ${view.params.claimId}`, screen: VIEWS.CLAIM_DETAIL, params: view.params });
        break;
      case VIEWS.POLICIES_LIST:
        breadcrumbs.push({ label: 'Policies', screen: VIEWS.POLICIES_LIST });
        break;
      case VIEWS.USERS_LIST:
        breadcrumbs.push({ label: 'Users', screen: VIEWS.USERS_LIST });
        break;
      case VIEWS.ACTIVITY_LOGS:
        breadcrumbs.push({ label: 'Activity Logs', screen: VIEWS.ACTIVITY_LOGS });
        break;
      case VIEWS.SUBMIT_CLAIM_FORM:
        breadcrumbs.push({ label: 'Claims', screen: VIEWS.CLAIMS_LIST });
        breadcrumbs.push({ label: 'Submit New Claim', screen: VIEWS.SUBMIT_CLAIM_FORM });
        break;
      case VIEWS.EDIT_CLAIM_FORM:
        breadcrumbs.push({ label: 'Claims', screen: VIEWS.CLAIMS_LIST });
        breadcrumbs.push({ label: `Claim ${view.params.claimId}`, screen: VIEWS.CLAIM_DETAIL, params: { claimId: view.params.claimId } });
        breadcrumbs.push({ label: 'Edit Claim', screen: VIEWS.EDIT_CLAIM_FORM, params: view.params });
        break;
      default:
        break;
    }
    return breadcrumbs;
  };

  const getCardColorByStatus = (statusLabel) => {
    const statusEntry = Object.values(STATUS_MAP).find(entry => entry.label === statusLabel);
    return statusEntry?.colorClass || 'status-default';
  };

  const getStatusLabel = (statusKey) => {
    return STATUS_MAP[statusKey]?.label || statusKey;
  };

  const canPerformAction = (requiredRoles) => {
    return currentUser && requiredRoles.includes(currentUser.role);
  };

  // --- Components for different views ---

  const Header = () => (
    <header className="header">
      <a href="#" className="header-logo" onClick={() => navigate(VIEWS.DASHBOARD)}>
        ClaimFlow
      </a>
      {currentUser && (
        <>
          <nav className="header-nav">
            <a href="#" className="header-nav-item" onClick={() => navigate(VIEWS.DASHBOARD)}>Dashboard</a>
            <a href="#" className="header-nav-item" onClick={() => navigate(VIEWS.CLAIMS_LIST)}>Claims</a>
            {canPerformAction([ROLES.ADMIN, ROLES.CLAIMS_OFFICER]) && (
              <a href="#" className="header-nav-item" onClick={() => navigate(VIEWS.POLICIES_LIST)}>Policies</a>
            )}
            {canPerformAction([ROLES.ADMIN]) && (
              <a href="#" className="header-nav-item" onClick={() => navigate(VIEWS.USERS_LIST)}>Users</a>
            )}
            {canPerformAction([ROLES.ADMIN, ROLES.CLAIMS_OFFICER, ROLES.VERIFICATION_OFFICER, ROLES.FINANCE_TEAM]) && (
              <a href="#" className="header-nav-item" onClick={() => navigate(VIEWS.ACTIVITY_LOGS)}>Logs</a>
            )}
          </nav>
          <div className="header-user-actions">
            <span className="user-display-name">{currentUser.name} ({currentUser.role})</span>
            <button className="button button-secondary" onClick={handleLogout}>Logout</button>
          </div>
        </>
      )}
    </header>
  );

  const Breadcrumbs = ({ paths }) => (
    <div className="breadcrumbs">
      {paths.map((path, index) => (
        <React.Fragment key={path.label}>
          <a
            href="#"
            className="breadcrumb-item"
            onClick={() => path.screen && navigate(path.screen, path.params)}
            style={{ pointerEvents: path.screen ? 'auto' : 'none' }}
          >
            {path.label}
          </a>
          {index < paths.length - 1 && <span className="breadcrumb-separator">/</span>}
        </React.Fragment>
      ))}
    </div>
  );

  const LoginScreen = () => (
    <div className="login-screen">
      <div className="login-card">
        <h2>Welcome to ClaimFlow</h2>
        <p style={{ marginBottom: 'var(--spacing-lg)' }}>Please select your role to log in:</p>
        <div className="login-role-buttons">
          {Object.values(ROLES).map(role => (
            <button
              key={role}
              className="button button-primary"
              onClick={() => handleLogin(role)}
              style={{ padding: 'var(--spacing-md) var(--spacing-lg)' }}
            >
              Login as {role.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const DashboardScreen = () => {
    const userClaims = currentUser?.role === ROLES.POLICYHOLDER
      ? data.claims.filter(claim => claim.policyholderId === currentUser.id)
      : data.claims;

    const totalClaims = userClaims.length;
    const pendingClaims = userClaims.filter(c => c.status === STATUS_MAP.PENDING.label || c.status === STATUS_MAP.IN_REVIEW.label || c.status === STATUS_MAP.SUBMITTED.label).length;
    const approvedClaims = userClaims.filter(c => c.status === STATUS_MAP.APPROVED.label).length;
    const settledAmount = userClaims.filter(c => c.status === STATUS_MAP.SETTLED.label).reduce((acc, c) => acc + (c.amountSettled || 0), 0);

    const recentActivities = data.activityLog
      .filter(activity => (currentUser.role === ROLES.POLICYHOLDER && activity.userId === currentUser.id) || (currentUser.role !== ROLES.POLICYHOLDER))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10); // Show 10 most recent

    return (
      <div className="screen-container">
        <Breadcrumbs paths={getBreadcrumbs()} />
        <div className="screen-header">
          <h1 className="screen-title">Dashboard</h1>
        </div>

        {canPerformAction([ROLES.POLICYHOLDER]) && (
          <button className="button button-primary margin-bottom-lg" onClick={() => navigate(VIEWS.SUBMIT_CLAIM_FORM)}>
            Submit New Claim
          </button>
        )}

        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Key Performance Indicators</h3>
        <div className="dashboard-grid">
          <div className="kpi-card">
            <span className="kpi-value">{totalClaims}</span>
            <span className="kpi-label">Total Claims</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-value">{pendingClaims}</span>
            <span className="kpi-label">Claims In Progress</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-value">{approvedClaims}</span>
            <span className="kpi-label">Approved Claims</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-value">${settledAmount.toLocaleString('en-US')}</span>
            <span className="kpi-label">Total Amount Settled</span>
          </div>
        </div>

        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Claim Analytics</h3>
        <div className="chart-section">
          <div className="chart-placeholder">Bar Chart: Claims by Type</div>
          <div className="chart-placeholder">Line Chart: Claims Over Time</div>
          <div className="chart-placeholder">Donut Chart: Claims by Status</div>
          <div className="chart-placeholder">Gauge Chart: Average Resolution Time</div>
        </div>

        <div className="recent-activities-panel">
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Recent Activities</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {recentActivities.map(activity => (
              <li key={activity.id} className="activity-item">
                <span className="bold">{activity.userName}</span> {activity.details}
                <span className="activity-timestamp">{activity.timestamp}</span>
              </li>
            ))}
            {(recentActivities?.length === 0) && (
              <div className="text-center muted padding-md">No recent activities.</div>
            )}
          </ul>
        </div>
      </div>
    );
  };

  const ClaimsListScreen = () => {
    const claimsToShow = currentUser?.role === ROLES.POLICYHOLDER
      ? data.claims.filter(claim => claim.policyholderId === currentUser.id)
      : data.claims;

    return (
      <div className="screen-container">
        <Breadcrumbs paths={getBreadcrumbs()} />
        <div className="screen-header">
          <h1 className="screen-title">Claims</h1>
          {(canPerformAction([ROLES.POLICYHOLDER])) && (
            <button className="button button-primary" onClick={() => navigate(VIEWS.SUBMIT_CLAIM_FORM)}>
              Submit New Claim
            </button>
          )}
          {(canPerformAction([ROLES.ADMIN, ROLES.CLAIMS_OFFICER, ROLES.VERIFICATION_OFFICER, ROLES.FINANCE_TEAM])) && (
            <div className="flex-row gap-md">
              <input type="text" placeholder="Search claims..." style={{ padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-sm)' }} />
              <button className="button button-outline">Filter</button>
              <button className="button button-outline">Sort</button>
              <button className="button button-outline">Export</button>
            </div>
          )}
        </div>

        {claimsToShow.length > 0 ? (
          <div className="card-grid">
            {claimsToShow.map(claim => (
              <div
                key={claim.id}
                className={`card ${getCardColorByStatus(claim.status)} ${claim.isPulsing ? 'live-pulse' : ''}`}
                onClick={() => navigate(VIEWS.CLAIM_DETAIL, { claimId: claim.id })}
              >
                <h3 className="card-title">{claim.claimNumber}</h3>
                <p>Policy: {claim.policyNumber}</p>
                <p>Policyholder: {claim.policyholderName}</p>
                <div className="card-meta">
                  <span>Submitted: {claim.submissionDate}</span>
                  <span className={`card-status card-status-label-${getCardColorByStatus(claim.status).replace('status-', '')}`}>
                    {claim.status}
                  </span>
                </div>
                {claim.status === STATUS_MAP.SLA_BREACHED.label && (
                  <p style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>SLA Breached! Due: {claim.slaDueDate}</p>
                )}
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary)' }}>Amount: ${claim.amountRequested.toLocaleString('en-US')}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center padding-lg">
            <p className="muted" style={{ marginBottom: 'var(--spacing-md)' }}>No claims found for your role.</p>
            {canPerformAction([ROLES.POLICYHOLDER]) && (
              <button className="button button-primary" onClick={() => navigate(VIEWS.SUBMIT_CLAIM_FORM)}>
                Submit Your First Claim
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const ClaimDetailScreen = () => {
    const claim = data.claims.find(c => c.id === view.params.claimId);
    if (!claim) {
      return (
        <div className="screen-container">
          <Breadcrumbs paths={getBreadcrumbs()} />
          <p className="text-center padding-lg">Claim not found.</p>
          <div className="text-center">
            <button className="button button-primary" onClick={() => navigate(VIEWS.CLAIMS_LIST)}>
              Back to Claims List
            </button>
          </div>
        </div>
      );
    }

    const currentSlaStatus = (new Date(claim.slaDueDate) < new Date() && claim.status !== STATUS_MAP.SETTLED.label && claim.status !== STATUS_MAP.REJECTED.label)
      ? STATUS_MAP.SLA_BREACHED.label
      : claim.status;

    // Filter audit logs for this claim
    const claimAuditLog = data.activityLog
      .filter(log => log.entityType === 'Claim' && log.entityId === claim.id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));


    return (
      <div className="screen-container">
        <Breadcrumbs paths={getBreadcrumbs()} />
        <div className="screen-header">
          <h1 className="screen-title">Claim {claim.claimNumber}</h1>
          <div className="flex-row gap-md">
            {(canPerformAction([ROLES.CLAIMS_OFFICER, ROLES.ADMIN]) && claim.status !== STATUS_MAP.SETTLED.label && claim.status !== STATUS_MAP.REJECTED.label) && (
              <button className="button button-primary" onClick={() => navigate(VIEWS.EDIT_CLAIM_FORM, { claimId: claim.id })}>
                Edit Claim
              </button>
            )}
            {(canPerformAction([ROLES.CLAIMS_OFFICER])) && (
              <button className="button button-secondary">Approve</button>
            )}
            {(canPerformAction([ROLES.CLAIMS_OFFICER])) && (
              <button className="button button-danger">Reject</button>
            )}
            {(canPerformAction([ROLES.VERIFICATION_OFFICER])) && (
              <button className="button button-info">Verify Documents</button>
            )}
          </div>
        </div>

        <div className="detail-view-container">
          <h3 className="detail-section-title">Claim Overview</h3>
          <div className="card-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="card" style={{ borderLeftColor: 'transparent', cursor: 'default', boxShadow: 'none' }}>
              <div className="detail-item"><span className="detail-label">Policy Number:</span> <span className="detail-value">{claim.policyNumber}</span></div>
              <div className="detail-item"><span className="detail-label">Policyholder:</span> <span className="detail-value">{claim.policyholderName}</span></div>
              <div className="detail-item"><span className="detail-label">Submission Date:</span> <span className="detail-value">{claim.submissionDate}</span></div>
              <div className="detail-item"><span className="detail-label">Incident Date:</span> <span className="detail-value">{claim.incidentDate}</span></div>
              <div className="detail-item"><span className="detail-label">Amount Requested:</span> <span className="detail-value">${claim.amountRequested?.toLocaleString('en-US')}</span></div>
              {claim.amountSettled && <div className="detail-item"><span className="detail-label">Amount Settled:</span> <span className="detail-value">${claim.amountSettled?.toLocaleString('en-US')}</span></div>}
            </div>
            <div className="card" style={{ borderLeftColor: 'transparent', cursor: 'default', boxShadow: 'none' }}>
              <div className="detail-item"><span className="detail-label">Current Status:</span> <span className={`card-status card-status-label-${getCardColorByStatus(claim.status).replace('status-', '')}`}>{claim.status}</span></div>
              <div className="detail-item"><span className="detail-label">Workflow Stage:</span> <span className="detail-value">{claim.currentWorkflowStage}</span></div>
              <div className="detail-item"><span className="detail-label">SLA Due Date:</span> <span className="detail-value" style={{ color: currentSlaStatus === STATUS_MAP.SLA_BREACHED.label ? 'var(--color-danger)' : 'inherit', fontWeight: currentSlaStatus === STATUS_MAP.SLA_BREACHED.label ? 'bold' : 'normal' }}>{claim.slaDueDate} ({currentSlaStatus === STATUS_MAP.SLA_BREACHED.label ? 'Breached' : 'On Track'})</span></div>
              <div className="detail-item"><span className="detail-label">Notes:</span> <span className="detail-value">{claim.notes}</span></div>
            </div>
          </div>

          <h3 className="detail-section-title" style={{ marginTop: 'var(--spacing-xl)' }}>Documents</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {claim.documents?.map(doc => (
              <li key={doc.id} style={{ marginBottom: 'var(--spacing-sm)' }}>
                <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: 'var(--spacing-sm)' }}>📄</span> {doc.name} (Preview)
                </a>
              </li>
            ))}
            {(claim.documents?.length === 0) && (
              <div className="muted">No documents uploaded.</div>
            )}
            {(canPerformAction([ROLES.POLICYHOLDER, ROLES.CLAIMS_OFFICER])) && (
              <button className="button button-outline margin-top-lg">Upload Document</button>
            )}
          </ul>

          <h3 className="detail-section-title" style={{ marginTop: 'var(--spacing-xl)' }}>Workflow & Audit Trail</h3>
          <div style={{ background: 'var(--color-neutral)', padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-md)', marginBottom: 'var(--spacing-lg)' }}>
            <p className="bold">Workflow Tracker (Visual Placeholder)</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary)' }}>
              <span>Submitted</span><span>&gt; In Review</span><span>&gt; Verified</span><span>&gt; Approved</span><span>&gt; Settled</span>
            </div>
          </div>
          {(canPerformAction([ROLES.ADMIN, ROLES.CLAIMS_OFFICER, ROLES.VERIFICATION_OFFICER, ROLES.FINANCE_TEAM])) && (
            <div className="recent-activities-panel" style={{ marginTop: 'var(--spacing-md)' }}>
              <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Claim Audit Log</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {claimAuditLog.map(activity => (
                  <li key={activity.id} className="activity-item">
                    <span className="bold">{activity.userName}</span> {activity.action} on this claim: {activity.details}
                    <span className="activity-timestamp">{activity.timestamp}</span>
                  </li>
                ))}
                {(claimAuditLog?.length === 0) && (
                  <div className="text-center muted padding-md">No audit log entries for this claim.</div>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ClaimFormScreen = ({ isEdit }) => {
    const claimToEdit = isEdit ? data.claims.find(c => c.id === view.params.claimId) : null;
    const [formData, setFormData] = useState(claimToEdit || {
      policyId: '',
      claimNumber: '',
      submissionDate: new Date().toISOString().split('T')[0],
      incidentDate: '',
      amountRequested: '',
      notes: '',
      documents: [],
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' })); // Clear error on change
      }
    };

    const handleFileChange = (e) => {
      // Simulate file upload
      const files = Array.from(e.target.files).map(file => ({
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        name: file.name,
        url: '#', // Placeholder
        type: file.type.startsWith('image/') ? 'image' : 'pdf', // Simple type detection
      }));
      setFormData(prev => ({ ...prev, documents: [...(prev.documents || []), ...files] }));
    };

    const validate = () => {
      let newErrors = {};
      if (!formData.policyId) newErrors.policyId = 'Policy is mandatory.';
      if (!formData.incidentDate) newErrors.incidentDate = 'Incident Date is mandatory.';
      if (!formData.amountRequested || formData.amountRequested <= 0) newErrors.amountRequested = 'Amount Requested must be a positive number.';
      return newErrors;
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const validationErrors = validate();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      const updatedClaims = isEdit
        ? data.claims.map(c => (c.id === claimToEdit?.id ? { ...c, ...formData } : c))
        : [...data.claims, {
            id: `clm-${Date.now()}`,
            ...formData,
            status: STATUS_MAP.SUBMITTED.label,
            currentWorkflowStage: 'Initial Review',
            policyholderId: currentUser?.id,
            policyholderName: currentUser?.name,
            policyNumber: data.policies.find(p => p.id === formData.policyId)?.policyNumber,
            claimNumber: `CLM-${Date.now().toString().slice(-6)}`,
            slaDueDate: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from submission
            auditLog: [{
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              userId: currentUser?.id,
              userName: currentUser?.name,
              action: 'Claim Submitted',
              details: `New claim ${`CLM-${Date.now().toString().slice(-6)}`} submitted by policyholder.`,
            }],
          }];

      setData(prev => ({ ...prev, claims: updatedClaims }));
      navigate(VIEWS.CLAIMS_LIST); // Go back to claims list
    };

    const availablePolicies = data.policies.filter(p => p.policyholderId === currentUser?.id);

    return (
      <div className="screen-container">
        <Breadcrumbs paths={getBreadcrumbs()} />
        <div className="screen-header">
          <h1 className="screen-title">{isEdit ? `Edit Claim ${claimToEdit?.claimNumber}` : 'Submit New Claim'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="policyId" className="form-label">Policy <span style={{ color: 'var(--color-danger)' }}>*</span></label>
            <select
              id="policyId"
              name="policyId"
              value={formData.policyId}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select a Policy</option>
              {availablePolicies.map(policy => (
                <option key={policy.id} value={policy.id}>{policy.policyNumber} ({policy.type})</option>
              ))}
            </select>
            {errors.policyId && <p className="form-error">{errors.policyId}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="incidentDate" className="form-label">Incident Date <span style={{ color: 'var(--color-danger)' }}>*</span></label>
            <input
              type="date"
              id="incidentDate"
              name="incidentDate"
              value={formData.incidentDate}
              onChange={handleChange}
              className="form-input"
              required
            />
            {errors.incidentDate && <p className="form-error">{errors.incidentDate}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="amountRequested" className="form-label">Amount Requested ($) <span style={{ color: 'var(--color-danger)' }}>*</span></label>
            <input
              type="number"
              id="amountRequested"
              name="amountRequested"
              value={formData.amountRequested}
              onChange={handleChange}
              className="form-input"
              min="0"
              required
            />
            {errors.amountRequested && <p className="form-error">{errors.amountRequested}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="notes" className="form-label">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="documents" className="form-label">Supporting Documents</label>
            <input
              type="file"
              id="documents"
              name="documents"
              onChange={handleFileChange}
              className="form-input"
              multiple
            />
            <div style={{ marginTop: 'var(--spacing-sm)' }}>
              {formData.documents?.map(doc => (
                <span key={doc.id} style={{ display: 'inline-block', background: 'var(--color-neutral)', padding: 'var(--spacing-xs) var(--spacing-sm)', borderRadius: 'var(--border-radius-sm)', marginRight: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>
                  {doc.name}
                </span>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="button button-primary">
              {isEdit ? 'Save Changes' : 'Submit Claim'}
            </button>
            <button type="button" className="button button-secondary" onClick={() => (isEdit ? navigate(VIEWS.CLAIM_DETAIL, { claimId: claimToEdit?.id }) : navigate(VIEWS.CLAIMS_LIST))}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  const PoliciesListScreen = () => {
    if (!canPerformAction([ROLES.ADMIN, ROLES.CLAIMS_OFFICER])) {
      return <div className="screen-container"><p className="text-center padding-lg">Access Denied: You do not have permission to view policies.</p></div>;
    }
    return (
      <div className="screen-container">
        <Breadcrumbs paths={getBreadcrumbs()} />
        <div className="screen-header">
          <h1 className="screen-title">Policies</h1>
          <div className="flex-row gap-md">
            <input type="text" placeholder="Search policies..." style={{ padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-sm)' }} />
            <button className="button button-outline">Filter</button>
            <button className="button button-outline">Sort</button>
            <button className="button button-outline">Export</button>
          </div>
        </div>

        {data.policies.length > 0 ? (
          <div className="card-grid">
            {data.policies.map(policy => (
              <div
                key={policy.id}
                className="card" // Policies typically don't have status colors like claims
                onClick={() => navigate(VIEWS.POLICY_DETAIL, { policyId: policy.id })} // Placeholder detail view
              >
                <h3 className="card-title">{policy.policyNumber}</h3>
                <p>Type: {policy.type}</p>
                <p>Policyholder: {policy.policyholderName}</p>
                <div className="card-meta">
                  <span>Start: {policy.startDate}</span>
                  <span>End: {policy.endDate}</span>
                </div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary)' }}>Coverage: ${policy.coverageAmount}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center padding-lg">
            <p className="muted">No policies found.</p>
          </div>
        )}
      </div>
    );
  };

  const UsersListScreen = () => {
    if (!canPerformAction([ROLES.ADMIN])) {
      return <div className="screen-container"><p className="text-center padding-lg">Access Denied: Only Admins can view users.</p></div>;
    }
    return (
      <div className="screen-container">
        <Breadcrumbs paths={getBreadcrumbs()} />
        <div className="screen-header">
          <h1 className="screen-title">Users</h1>
          <div className="flex-row gap-md">
            <input type="text" placeholder="Search users..." style={{ padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-sm)' }} />
            <button className="button button-outline">Filter</button>
            <button className="button button-outline">Sort</button>
          </div>
        </div>
        <div className="card-grid">
          {data.users.map(user => (
            <div
              key={user.id}
              className="card"
              onClick={() => navigate(VIEWS.USER_DETAIL, { userId: user.id })} // Placeholder detail view
            >
              <h3 className="card-title">{user.name}</h3>
              <p>Email: {user.email}</p>
              <p>Role: <span className={`card-status card-status-label-submitted`} style={{ backgroundColor: user.role === ROLES.ADMIN ? 'var(--color-danger)' : 'var(--color-primary)' }}>{user.role}</span></p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ActivityLogScreen = () => {
    if (!canPerformAction([ROLES.ADMIN, ROLES.CLAIMS_OFFICER, ROLES.VERIFICATION_OFFICER, ROLES.FINANCE_TEAM])) {
      return <div className="screen-container"><p className="text-center padding-lg">Access Denied: You do not have permission to view activity logs.</p></div>;
    }

    // Role-based visibility for logs (e.g., Policyholder logs only their own)
    const logsToShow = currentUser?.role === ROLES.POLICYHOLDER
      ? data.activityLog.filter(log => log.userId === currentUser.id)
      : data.activityLog;

    const sortedLogs = logsToShow.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return (
      <div className="screen-container">
        <Breadcrumbs paths={getBreadcrumbs()} />
        <div className="screen-header">
          <h1 className="screen-title">System Activity Logs</h1>
          <div className="flex-row gap-md">
            <input type="text" placeholder="Search logs..." style={{ padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-sm)' }} />
            <button className="button button-outline">Filter</button>
            <button className="button button-outline">Export</button>
          </div>
        </div>
        <div className="recent-activities-panel">
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {sortedLogs.length > 0 ? (
              sortedLogs.map(activity => (
                <li key={activity.id} className="activity-item">
                  <span className="bold">{activity.userName}</span> {activity.action} on {activity.entityType || 'system'} {activity.entityId ? `(ID: ${activity.entityId})` : ''}: {activity.details}
                  <span className="activity-timestamp">{activity.timestamp}</span>
                </li>
              ))
            ) : (
              <div className="text-center muted padding-md">No activity logs found.</div>
            )}
          </ul>
        </div>
      </div>
    );
  };


  const renderScreen = () => {
    switch (view.screen) {
      case VIEWS.LOGIN:
        return <LoginScreen />;
      case VIEWS.DASHBOARD:
        return <DashboardScreen />;
      case VIEWS.CLAIMS_LIST:
        return <ClaimsListScreen />;
      case VIEWS.CLAIM_DETAIL:
        return <ClaimDetailScreen />;
      case VIEWS.POLICIES_LIST:
        return <PoliciesListScreen />;
      case VIEWS.USERS_LIST:
        return <UsersListScreen />;
      case VIEWS.ACTIVITY_LOGS:
        return <ActivityLogScreen />;
      case VIEWS.SUBMIT_CLAIM_FORM:
        return <ClaimFormScreen isEdit={false} />;
      case VIEWS.EDIT_CLAIM_FORM:
        return <ClaimFormScreen isEdit={true} />;
      // Placeholder for other screens
      case VIEWS.POLICY_DETAIL:
      case VIEWS.USER_DETAIL:
      default:
        return (
          <div className="screen-container">
            <Breadcrumbs paths={getBreadcrumbs()} />
            <h1 className="screen-title">Welcome</h1>
            <p className="text-center padding-lg">This is a placeholder for the {view.screen} screen.</p>
            <div className="text-center">
              <button className="button button-primary" onClick={() => navigate(VIEWS.DASHBOARD)}>Go to Dashboard</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        {renderScreen()}
      </main>
    </div>
  );
};

export default App;