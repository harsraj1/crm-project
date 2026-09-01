import { Mail, Target, Users, Plus, Search, ChevronRight, Edit, Trash2, X, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { leadsAPI } from '../services/api';
import { clsx } from 'clsx';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', company: '', status: 'new', value: 0, source: 'other' });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, sort: '-createdAt' };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const [leadsRes, statsRes] = await Promise.all([
        leadsAPI.getAll(params),
        leadsAPI.getStats()
      ]);
      setLeads(leadsRes.data.data);
      setTotal(leadsRes.data.total);
      setTotalPages(leadsRes.data.pages);
      setStats(statsRes.data.data.byStatus);
    } catch (error) {
      console.error('Failed to load leads:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const resetForm = () => setForm({ name: '', email: '', company: '', status: 'new', value: 0, source: 'other' });

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingLead(null);
    resetForm();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingLead) await leadsAPI.update(editingLead._id, form);
      else await leadsAPI.create(form);
      closeModal();
      await fetchLeads();
    } catch (error) {
      setError(error.response?.data?.error || 'Unable to save lead');
    }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setForm({
      name: lead.name,
      email: lead.email,
      company: lead.company || '',
      status: lead.status,
      value: lead.value || 0,
      source: lead.source || 'other'
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (lead) => {
    if (!window.confirm(`Delete ${lead.name}? This cannot be undone.`)) return;
    setError('');
    try {
      await leadsAPI.delete(lead._id);
      await fetchLeads();
    } catch (error) {
      setError(error.response?.data?.error || 'Unable to delete lead');
    }
  };

  const statusOptions = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];
  const getStatusConfig = (status) => {
    const config = {
      new: { label: 'New', color: 'gray', icon: Users },
      contacted: { label: 'Contacted', color: 'blue', icon: Mail },
      qualified: { label: 'Qualified', color: 'yellow', icon: Target },
      proposal: { label: 'Proposal', color: 'purple', icon: FileText },
      'closed-won': { label: 'Won', color: 'green', icon: CheckCircle },
      'closed-lost': { label: 'Lost', color: 'red', icon: XCircle }
    };
    return config[status] || { label: status, color: 'gray', icon: Users };
  };

  if (loading && leads.length === 0) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and track your sales leads</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-40 hidden sm:block"
          >
            <option value="">All Statuses</option>
            {statusOptions.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
          </select>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            <Plus className="w-5 h-5 mr-2" /> Add Lead
          </button>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
        <StatChip label="Total" value={total} color="gray" />
        {statusOptions.map(status => {
          const config = getStatusConfig(status);
          const stat = stats.find(s => s._id === status);
          return (
            <StatChip key={status} label={config.label} value={stat?.count || 0} color={config.color} />
          );
        })}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lead</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Contact</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {leads.map(lead => {
                const config = getStatusConfig(lead.status);
                const Icon = config.icon;
                return (
                  <tr key={lead._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <Link to={`/leads/${lead._id}`} className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <Icon className={clsx('w-5 h-5', `text-${config.color}-600 dark:text-${config.color}-400`)} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{lead.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{lead.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-gray-600 dark:text-gray-400">{lead.company || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={clsx('badge', `badge-${config.color}`)}>{config.label}</span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-gray-600 dark:text-gray-400">${lead.value?.toLocaleString() || '0'}</td>
                    <td className="px-6 py-4 hidden md:table-cell text-gray-600 dark:text-gray-400 capitalize">{lead.source}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {lead.lastContacted ? new Date(lead.lastContacted).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link to={`/leads/${lead._id}`} className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400" title="View">
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                        <button onClick={() => handleEdit(lead)} className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400" title="Edit">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(lead)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400" title="Delete">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No leads found. <Link to="#" className="text-primary-600" onClick={(e) => { e.preventDefault(); setShowCreateModal(true); }}>Create your first lead</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} results
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-sm px-3 py-1"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary text-sm px-3 py-1"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateLeadModal
          isOpen={showCreateModal}
          onClose={closeModal}
          onSubmit={handleSave}
          form={form}
          setForm={setForm}
          editing={Boolean(editingLead)}
        />
      )}
    </div>
  );
}

function StatChip({ label, value, color }) {
  const colors = {
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  };
  return (
    <div className={`rounded-lg p-3 ${colors[color]}`}>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function CreateLeadModal({ isOpen, onClose, onSubmit, form, setForm, editing }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{editing ? 'Edit Lead' : 'Create New Lead'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Name *</label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="label">Company</label>
              <input
                type="text"
                name="company"
                value={form.company}
                onChange={e => setForm({ ...form, company: e.target.value })}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="input mt-1"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed-won">Closed Won</option>
                <option value="closed-lost">Closed Lost</option>
              </select>
            </div>
            <div>
              <label className="label">Value ($)</label>
              <input
                type="number"
                name="value"
                min="0"
                value={form.value}
                onChange={e => setForm({ ...form, value: parseInt(e.target.value) || 0 })}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="label">Source</label>
              <select
                name="source"
                value={form.source}
                onChange={e => setForm({ ...form, source: e.target.value })}
                className="input mt-1"
              >
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="cold-call">Cold Call</option>
                <option value="email">Email</option>
                <option value="social">Social Media</option>
                <option value="event">Event</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex space-x-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">{editing ? 'Save Changes' : 'Create Lead'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
