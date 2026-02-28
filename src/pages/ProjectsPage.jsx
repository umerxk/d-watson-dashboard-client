import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export default function ProjectsPage() {
  const token = localStorage.getItem('dw_token');
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmProject, setConfirmProject] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', is_active: true });
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const loadProjects = () => {
    if (!token) return;
    setLoading(true);
    axios
      .get(`${API_BASE}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setProjects(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(
        `${API_BASE}/projects`,
        { name, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName('');
      setDescription('');
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  const openEditModal = (p) => {
    setError('');
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || '',
      is_active: !!p.is_active
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setSubmitLoading(true);
    setError('');
    try {
      await axios.put(
        `${API_BASE}/projects/${editingId}`,
        { name: form.name, description: form.description, is_active: form.is_active },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      closeModal();
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleStatus = async (p) => {
    try {
      await axios.put(
        `${API_BASE}/projects/${p.id}`,
        { name: p.name, description: p.description || '', is_active: !p.is_active },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="grid">
      <div className="card">
        <h2>Create project</h2>
        {error && !modalOpen && <div className="alert-error">{error}</div>}
        <form onSubmit={handleCreate} className="form-grid form-stacked">
          <label className="field-label">
            Name
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="field-label">
            Description
            <textarea
              className="input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <button className="primary-btn" type="submit">
            Add project
          </button>
        </form>
      </div>
      <div className="card full-width">
        <div className="card-header">
          <h2>All projects</h2>
        </div>
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <p className="empty-state">No projects yet. Add your first project above.</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th className="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.description}</td>
                    <td>
                      <span className={p.is_active ? 'status-active' : 'status-closed'}>
                        {p.is_active ? 'Active' : 'Closed'}
                      </span>
                    </td>
                    <td className="td-actions">
                      <button type="button" className="btn-icon" onClick={() => openEditModal(p)} title="Edit">
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                      onClick={() => setConfirmProject(p)}
                        title={p.is_active ? 'Close project' : 'Activate project'}
                      >
                        {p.is_active ? 'Close' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit project modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit project</h2>
              <button type="button" className="modal-close" onClick={closeModal} aria-label="Close">
                ×
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="modal-body form-grid">
              {error && (
                <div className="alert-error" style={{ gridColumn: '1 / -1' }}>
                  {error}
                </div>
              )}
              <label className="field-label" style={{ gridColumn: '1 / -1' }}>
                Name
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </label>
              <label className="field-label" style={{ gridColumn: '1 / -1' }}>
                Description
                <textarea
                  className="input"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </label>
              <label className="field-label" style={{ gridColumn: '1 / -1' }}>
                Status
                <select
                  className="input"
                  value={form.is_active ? '1' : '0'}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.value === '1' }))}
                >
                  <option value="1">Active</option>
                  <option value="0">Closed</option>
                </select>
              </label>
              <div className="modal-footer" style={{ gridColumn: '1 / -1' }}>
                <button type="button" className="secondary-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={submitLoading}>
                  {submitLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm close/activate modal */}
      {confirmProject && (
        <div className="modal-overlay" onClick={() => setConfirmProject(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{confirmProject.is_active ? 'Close project?' : 'Activate project?'}</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setConfirmProject(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                {confirmProject.is_active
                  ? 'This will mark the project as closed. You can still view data but it will be treated as inactive.'
                  : 'This will mark the project as active and it will appear in dashboards as an ongoing project.'}
              </p>
              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setConfirmProject(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={async () => {
                    if (!confirmProject) return;
                    await handleToggleStatus(confirmProject);
                    setConfirmProject(null);
                  }}
                >
                  {confirmProject.is_active ? 'Yes, close' : 'Yes, activate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
