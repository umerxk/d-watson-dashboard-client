import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export default function OverviewPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('dw_token');
    if (!token) return;
    setLoading(true);
    axios
      .get(`${API_BASE}/dashboard/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setSummary(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="card">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="card alert-error">{error}</div>;
  }

  if (!summary) return null;

  const { overall, projects } = summary;

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 2
    }).format(value);

  return (
    <div className="grid">
      <div className="card kpi-card">
        <h2>Total Cash Inflow</h2>
        <p className="kpi-value">{formatCurrency(overall.total_inflow)}</p>
      </div>
      <div className="card kpi-card">
        <h2>Total Expense</h2>
        <p className="kpi-value">{formatCurrency(overall.total_expense)}</p>
      </div>
      <div className="card kpi-card">
        <h2>Balance</h2>
        <p className={`kpi-value ${overall.balance < 0 ? 'negative' : 'positive'}`}>
          {formatCurrency(overall.balance)}
        </p>
      </div>
      <div className="card full-width">
        <div className="card-header">
          <h2>Projects summary</h2>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Cash Inflow</th>
                <th>Expense</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.project_id}>
                  <td>{p.project_name}</td>
                  <td>{formatCurrency(p.total_inflow)}</td>
                  <td>{formatCurrency(p.total_expense)}</td>
                  <td className={p.balance < 0 ? 'negative' : 'positive'}>
                    {formatCurrency(p.balance)}
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

