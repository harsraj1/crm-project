import { Link } from 'react-router-dom';
import { Users, UserPlus, TrendingUp, Target, DollarSign, Calendar } from 'lucide-react';
import { leadsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalLeads: 0, totalValue: 0, byStatus: [] });
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, leadsRes] = await Promise.all([
          leadsAPI.getStats(),
          leadsAPI.getAll({ limit: 5, sort: '-createdAt' })
        ]);
        setStats(statsRes.data.data);
        setRecentLeads(leadsRes.data.data);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusConfig = {
    new: { label: 'New', color: 'gray', icon: Users },
    contacted: { label: 'Contacted', color: 'blue', icon: Mail },
    qualified: { label: 'Qualified', color: 'yellow', icon: Target },
    proposal: { label: 'Proposal', color: 'purple', icon: FileText },
    'closed-won': { label: 'Won', color: 'green', icon: CheckCircle },
    'closed-lost': { label: 'Lost', color: 'red', icon: XCircle }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.name}! Here's what's happening.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Leads" value={stats.totalLeads || 0} icon={Users} color="blue" />
        <StatCard title="Pipeline Value" value={`$${(stats.totalValue || 0).toLocaleString()}`} icon={DollarSign} color="green" />
        <StatCard title="Active Deals" value={stats.byStatus?.find(s => s._id !== 'closed-won' && s._id !== 'closed-lost')?.count || 0} icon={Target} color="purple" />
        <StatCard title="Won This Month" value={stats.byStatus?.find(s => s._id === 'closed-won')?.count || 0} icon={CheckCircle} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pipeline by Status</h3>
          <div className="space-y-3">
            {stats.byStatus?.map((status) => {
              const config = statusConfig[status._id] || { label: status._id, color: 'gray' };
              const ColorIcon = config.icon;
              return (
                <div key={status._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ColorIcon className={`w-5 h-5 text-${config.color}-600 dark:text-${config.color}-400`} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{config.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{status.count}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">${status.totalValue.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Leads</h3>
            <Link to="/leads" className="text-sm text-primary-600 hover:text-primary-500">View all</Link>
          </div>
          <div className="space-y-3">
            {recentLeads.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No leads yet. <Link to="/leads" className="text-primary-600">Add your first lead</Link></p>
            ) : (
              recentLeads.map((lead) => (
                <Link key={lead._id} to={`/leads/${lead._id}`} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{lead.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{lead.company || lead.email}</p>
                  </div>
                  <span className={`badge badge-${getStatusBadgeColor(lead.status)}`}>{lead.status}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
  };
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="w-6 h-6" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

const getStatusBadgeColor = (status) => {
  const colors = {
    new: 'gray',
    contacted: 'blue',
    qualified: 'yellow',
    proposal: 'purple',
    'closed-won': 'green',
    'closed-lost': 'red'
  };
  return colors[status] || 'gray';
};