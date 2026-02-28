import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export default function ExpensesPage() {
  const token = localStorage.getItem('dw_token');
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [rows, setRows] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form, setForm] = useState({
    project_id: '',
    date: '',
    name: '',
    description: '',
    paid: '',
    category_id: '',
    remarks: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API_BASE}/projects`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setProjects(res.data));
    axios
      .get(`${API_BASE}/expenses/categories`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setCategories(res.data));
  }, []);

  const loadRows = () => {
    if (!projectId || !token) return;
    setTableLoading(true);
    setRows([]);
    axios
      .get(`${API_BASE}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { projectId }
      })
      .then((res) => setRows(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load expenses'))
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
        name: row.name,
        description: row.description,
        paid: String(row.paid),
        category_id: String(row.category_id),
        remarks: row.remarks || ''
      });
    } else {
      setEditingId(null);
      setForm({
        project_id: '',
        date: '',
        name: '',
        description: '',
        paid: '',
        category_id: '',
        remarks: ''
      });
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
          `${API_BASE}/expenses/${editingId}`,
          {
            date: form.date,
            name: form.name,
            description: form.description,
            paid: Number(form.paid),
            category_id: Number(form.category_id),
            remarks: form.remarks
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_BASE}/expenses`,
          { project_id: form.project_id, ...form, paid: Number(form.paid) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      closeModal();
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || (editingId ? 'Failed to update expense' : 'Failed to add expense'));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await axios.delete(`${API_BASE}/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const formatCurrency = (n) => Number(n).toLocaleString('en-PK');
  const totalPaid = rows.reduce((sum, r) => sum + Number(r.paid), 0);

  return (
    <div className="expenses-page">
      {/* Top bar: select on left, add button on right */}
      <div className="inflows-topbar">
        <select
          className="input input-select"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        >
          <option value="">Select a project to view expenses</option>
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
          title="Add expense for any project"
        >
          Add expense
        </button>
      </div>

      {/* Table card */}
      <div className="card card-table">
        {!projectId ? (
          <div className="empty-state empty-state-large">
            <p>Select a project above to view expenses. Use "Add expense" to add entries for any project.</p>
          </div>
        ) : (
          <>
            {tableLoading ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>Loading expenses...</p>
              </div>
            ) : rows.length === 0 ? (
              <div className="empty-state">
                <p>No expenses yet. Click "Add expense" to add your first entry.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Paid</th>
                      <th>Remarks</th>
                      <th className="th-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td>{r.date}</td>
                        <td>{r.name}</td>
                        <td>{r.description}</td>
                        <td>{r.category_label}</td>
                        <td>{formatCurrency(r.paid)}</td>
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
                      <td colSpan={4} className="table-footer-label">
                        Total
                      </td>
                      <td className="table-footer-value">{formatCurrency(totalPaid)}</td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add expense modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit expense' : 'Add expense'}</h2>
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
                Name
                <input
                  className="input"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="field-label">
                Description
                <input
                  className="input"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="field-label">
                Paid (PKR)
                <input
                  className="input"
                  type="number"
                  name="paid"
                  value={form.paid}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="field-label">
                Category
                <select
                  className="input"
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
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
                  {submitLoading ? (editingId ? 'Saving...' : 'Adding...') : (editingId ? 'Save' : 'Add expense')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
