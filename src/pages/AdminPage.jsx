import React, { useState, useEffect } from 'react';

export default function AdminPage() {
  const [token, setToken] = useState(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [responses, setResponses] = useState([]);
  const [coverage, setCoverage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function login(e) {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setLoginError('Invalid password');
        return;
      }
      const data = await res.json();
      setToken(data.token);
    } catch {
      setLoginError('Connection error');
    }
  }

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch('/api/admin/responses', { headers }).then(r => r.json()),
      fetch('/api/admin/coverage', { headers }).then(r => r.json()),
    ]).then(([resData, covData]) => {
      setResponses(resData);
      setCoverage(covData);
      setLoading(false);
    });
  }, [token]);

  if (!token) {
    return (
      <div className="admin-container">
        <div className="login-form card">
          <h2>Admin Login</h2>
          <form onSubmit={login}>
            <div className="form-group">
              <label htmlFor="admin-pw">Password</label>
              <input
                type="password"
                id="admin-pw"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            {loginError && <p className="error-message" role="alert">{loginError}</p>}
            <button type="submit" className="btn btn-primary">Log in</button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-container">
        <p>Loading…</p>
      </div>
    );
  }

  const experienceLevels = ['Junior', 'Mid', 'Senior'];
  const usageLevels = ['Light', 'Regular', 'Power'];

  function getCount(exp, usage) {
    return coverage?.current?.[exp]?.[usage] || 0;
  }

  function getTarget(exp, usage) {
    return coverage?.target?.[exp]?.[usage] || 0;
  }

  const eligibleCount = responses.filter(r => r.eligible).length;
  const totalCount = responses.length;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1>Screener Admin</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            {eligibleCount} eligible / {totalCount} total responses
          </p>
        </div>
        <div className="admin-actions">
          <button
            className="btn btn-secondary"
            onClick={() => {
              fetch('/api/admin/export', {
                headers: { Authorization: `Bearer ${token}` },
              }).then(r => r.blob()).then(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'screener-responses.csv';
                a.click();
                URL.revokeObjectURL(url);
              });
            }}
          >
            Export CSV
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setToken(null)}
          >
            Log out
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Coverage Dashboard</h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          Target ≈ 9–10 participants. Cells show current / target.
        </p>
        <div className="coverage-grid">
          <div className="coverage-cell header"></div>
          {usageLevels.map(u => (
            <div key={u} className="coverage-cell header">{u}</div>
          ))}
          {experienceLevels.map(exp => (
            <React.Fragment key={exp}>
              <div className="coverage-cell header">{exp}</div>
              {usageLevels.map(usage => {
                const count = getCount(exp, usage);
                const target = getTarget(exp, usage);
                const isFilled = count >= target;
                const isPriority = (exp === 'Mid' && usage === 'Regular') ||
                                   (exp === 'Senior' && usage === 'Light');
                return (
                  <div
                    key={`${exp}-${usage}`}
                    className={`coverage-cell ${isFilled ? 'filled' : ''} ${isPriority ? 'priority' : ''}`}
                  >
                    <div className="count">{count}</div>
                    <div className="target">/ {target}</div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Responses</h2>
        <div className="table-scroll">
          <table className="response-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Segment</th>
                <th>Flags</th>
                <th>Q4 (Role)</th>
                <th>Q6 (Episode)</th>
                <th>Q7</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {responses.map(r => (
                <tr key={r.id}>
                  <td>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td>
                    {r.eligible
                      ? <span className="badge badge-eligible">Eligible</span>
                      : <span className="badge badge-ineligible">Ineligible</span>
                    }
                  </td>
                  <td>{r.segment_label || '—'}</td>
                  <td>
                    {r.low_experience_flag
                      ? <span className="badge badge-flag">&lt;1yr</span>
                      : '—'
                    }
                  </td>
                  <td>{r.q4_role || '—'}</td>
                  <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.q6 || '—'}
                  </td>
                  <td>{r.q7 || '—'}</td>
                  <td style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                    {r.id?.slice(0, 8)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
