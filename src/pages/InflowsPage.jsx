import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export default function InflowsPage() {
  const token = localStorage.getItem('dw_token');
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [rows, setRows] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form, setForm] = useState({
    project_id: '',
    date: '',
    received_from: '',
    received_by: '',
    amount: '',
    remarks: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API_BASE}/projects`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setProjects(res.data));
  }, []);

  const loadRows = () => {
    if (!projectId || !token) return;
    setTableLoading(true);
    setRows([]);
    axios
      .get(`${API_BASE}/inflows`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { projectId }
      })
      .then((res) => setRows(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load inflows'))
      .finally(() => setTableLoading(false));
  };

  useEffect(() => {
    if (projectId) loadRows();
    else setRows([]);
  }, [projectId]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const openModal = (row = null) => {
    setError('');
    if (row) {
      setEditingId(row.id);
      setForm({
        project_id: String(projectId),
        date: row.date,
        received_from: row.received_from,
        received_by: row.received_by,
        amount: String(row.amount),
        remarks: row.remarks || ''
      });
    } else {
      setEditingId(null);
      setForm({ project_id: '', date: '', received_from: '', received_by: '', amount: '', remarks: '' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.project_id && !editingId) return;
    setSubmitLoading(true);
    setError('');
    try {
      if (editingId) {
        await axios.put(
          `${API_BASE}/inflows/${editingId}`,
          { date: form.date, received_from: form.received_from, received_by: form.received_by, amount: Number(form.amount), remarks: form.remarks },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_BASE}/inflows`,
          { project_id: form.project_id, ...form, amount: Number(form.amount) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      closeModal();
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || (editingId ? 'Failed to update inflow' : 'Failed to add inflow'));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this cash flow?')) return;
    try {
      await axios.delete(`${API_BASE}/inflows/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const formatCurrency = (n) => Number(n).toLocaleString('en-PK');
  const totalInflow = rows.reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <div className="inflows-page">
      {/* Top bar: select on left, add button on right */}
      <div className="inflows-topbar">
        <select
          className="input input-select"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        >
          <option value="">Select a project to view cash flows</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="primary-btn btn-sm"
          onClick={() => openModal()}
          title="Add cash flow for any project"
        >
          Add cash flow
        </button>
      </div>

      {/* Table card */}
      <div className="card card-table">
        {!projectId ? (
          <div className="empty-state empty-state-large">
            <p>Select a project above to view cash flows. Use "Add cash flow" to add entries for any project.</p>
          </div>
        ) : (
          <>
            {tableLoading ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>Loading inflows...</p>
              </div>
            ) : rows.length === 0 ? (
              <div className="empty-state">
                <p>No cash inflows yet. Click "Add cash flow" to add your first entry.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Received from</th>
                      <th>Received by</th>
                      <th>Amount</th>
                      <th>Remarks</th>
                      <th className="th-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td>{r.date}</td>
                        <td>{r.received_from}</td>
                        <td>{r.received_by}</td>
                        <td>{formatCurrency(r.amount)}</td>
                        <td>{r.remarks}</td>
                        <td className="td-actions">
                          <button type="button" className="btn-icon" onClick={() => openModal(r)} title="Edit">
                            Edit
                          </button>
                          <button type="button" className="btn-icon btn-danger" onClick={() => handleDelete(r.id)} title="Delete">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="table-footer-label">
                        Total
                      </td>
                      <td className="table-footer-value">{formatCurrency(totalInflow)}</td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add cash flow modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit cash flow' : 'Add cash flow'}</h2>
              <button type="button" className="modal-close" onClick={closeModal} aria-label="Close">
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body form-grid">
              {error && (
                <div className="alert-error" style={{ gridColumn: '1 / -1' }}>
                  {error}
                </div>
              )}
              {!editingId && (
                <label className="field-label" style={{ gridColumn: '1 / -1' }}>
                  Project
                  <select
                    className="input"
                    name="project_id"
                    value={form.project_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="field-label">
                Date
                <input
                  className="input"
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="field-label">
                Received from
                <input
                  className="input"
                  name="received_from"
                  value={form.received_from}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="field-label">
                Received by
                <input
                  className="input"
                  name="received_by"
                  value={form.received_by}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="field-label">
                Amount (PKR)
                <input
                  className="input"
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="field-label" style={{ gridColumn: '1 / -1' }}>
                Remarks
                <input
                  className="input"
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                />
              </label>
              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={submitLoading}>
                  {submitLoading ? (editingId ? 'Saving...' : 'Adding...') : (editingId ? 'Save' : 'Add inflow')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
