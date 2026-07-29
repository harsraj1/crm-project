import { useState, useEffect } from 'react';
import { customersAPI } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, UserPlus, Filter, ChevronRight, Edit, Trash2, Mail, Phone, Building2, MapPin } from 'lucide-react';
import { clsx } from 'clsx';

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', company: '', status: 'prospect' });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, sort: '-createdAt' };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await customersAPI.getAll(params);
      setCustomers(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.pages);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, [page, search, statusFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await customersAPI.create(form);
      setShowCreateModal(false);
      setForm({ firstName: '', lastName: '', email: '', phone: '', company: '', status: 'prospect' });
      fetchCustomers();
    } catch (error) {
      console.error('Failed to create customer:', error);
    }
  };

  const statusOptions = ['prospect', 'active', 'inactive', 'churned'];

  if (loading && customers.length === 0) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your customer relationships</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-10 w-64" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-40 hidden sm:block">
            <option value="">All Statuses</option>
            {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center">
            <UserPlus className="w-5 h-5 mr-2" /> Add Customer
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lifetime Value</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {customers.map(customer => {
                const statusColors = {
                  prospect: 'gray',
                  active: 'green',
                  inactive: 'yellow',
                  churned: 'red'
                };
                const color = statusColors[customer.status] || 'gray';
                return (
                  <tr key={customer._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                            {customer.firstName?.[0]}{customer.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{customer.firstName} {customer.lastName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-gray-600 dark:text-gray-400">{customer.company || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={clsx('badge capitalize', `badge-${color}`)}>{customer.status}</span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" /> {customer.email}
                        {customer.phone && <span className="hidden md:inline-flex items-center space-x-1 ml-4"><Phone className="w-4 h-4 text-gray-400" /> {customer.phone}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">${customer.lifetimeValue?.toLocaleString() || '0'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link to={`/customers/${customer._id}`} className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400" title="View">
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                        <button className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400" title="Edit">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400" title="Delete">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No customers found. <Link to="#" className="text-primary-600" onClick={e => { e.preventDefault(); setShowCreateModal(true); }}>Create your first customer</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {Math.min(((page - 1) * 20) + 1, total)} to {Math.min(page * 20, total)} of {total} results
            </p>
            <div className="flex items-center space-x-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm px-3 py-1">Previous</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary text-sm px-3 py-1">Next</button>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateCustomerModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
          form={form}
          setForm={setForm}
        />
      )}
    </div>
  );
}

function CreateCustomerModal({ isOpen, onClose, onSubmit, form, setForm }) {
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Customer</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name *</label>
                <input type="text" name="firstName" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="input mt-1" />
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input type="text" name="lastName" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="input mt-1" />
              </div>
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" name="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input mt-1" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input type="tel" name="phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input mt-1" />
            </div>
            <div>
              <label className="label">Company</label>
              <input type="text" name="company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="input mt-1" />
            </div>
            <div>
              <label className="label">Status</label>
              <select name="status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input mt-1">
                <option value="prospect">Prospect</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="churned">Churned</option>
              </select>
            </div>
            <div className="flex space-x-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">Create Customer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}