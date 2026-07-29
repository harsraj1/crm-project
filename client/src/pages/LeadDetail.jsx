import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { leadsAPI, activitiesAPI } from '../services/api';
import { Mail, Phone, DollarSign, Calendar, MapPin, Building2, Tag, Loader2, ChevronLeft, Edit, Trash2, Plus, Sparkles, MessageSquare, Clock, User, X, Check } from 'lucide-react';
import { clsx } from 'clsx';

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityForm, setActivityForm] = useState({ type: 'call', subject: '', description: '', duration: 0, outcome: '', nextFollowUp: '' });

  const fetchData = async () => {
    try {
      const [leadRes, activitiesRes] = await Promise.all([
        leadsAPI.getOne(id),
        activitiesAPI.getByLead(id)
      ]);
      setLead(leadRes.data.data);
      setActivities(activitiesRes.data);
    } catch (error) {
      console.error('Failed to load lead:', error);
      navigate('/leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    setActivityLoading(true);
    try {
      await activitiesAPI.create(id, activityForm);
      setShowActivityForm(false);
      setActivityForm({ type: 'call', subject: '', description: '', duration: 0, outcome: '', nextFollowUp: '' });
      const res = await activitiesAPI.getByLead(id);
      setActivities(res.data);
    } catch (error) {
      console.error('Failed to add activity:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleAiSummary = async () => {
    try {
      await leadsAPI.requestAiSummary(id);
      const res = await leadsAPI.getOne(id);
      setLead(res.data.data);
    } catch (error) {
      console.error('Failed to request AI summary:', error);
    }
  };

  const statusConfig = {
    new: { label: 'New', color: 'gray', icon: User },
    contacted: { label: 'Contacted', color: 'blue', icon: MessageSquare },
    qualified: { label: 'Qualified', color: 'yellow', icon: Target },
    proposal: { label: 'Proposal', color: 'purple', icon: FileText },
    negotiation: { label: 'Negotiation', color: 'orange', icon: Handshake },
    'closed-won': { label: 'Won', color: 'green', icon: Trophy },
    'closed-lost': { label: 'Lost', color: 'red', icon: XCircle }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
  if (!lead) return <div className="text-center py-12">Lead not found</div>;

  const config = statusConfig[lead.status] || { label: lead.status, color: 'gray', icon: User };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/leads" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{lead.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">{lead.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={clsx('badge px-3 py-1', `badge-${config.color}`)}>
            <config.icon className="w-4 h-4 mr-1" /> {config.label}
          </span>
          <button onClick={handleAiSummary} className="btn-secondary">
            <Sparkles className="w-4 h-4 mr-2" /> AI Summary
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lead Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailField label="Company" value={lead.company || '—'} icon={Building2} />
              <DetailField label="Phone" value={lead.phone || '—'} icon={Phone} />
              <DetailField label="Value" value={`$${lead.value?.toLocaleString() || '0'}`} icon={DollarSign} />
              <DetailField label="Source" value={lead.source?.replace('_', ' ') || '—'} icon={Target} />
              <DetailField label="Created" value={new Date(lead.createdAt).toLocaleDateString()} icon={Calendar} />
              <DetailField label="Last Contact" value={lead.lastContacted ? new Date(lead.lastContacted).toLocaleDateString() : 'Never'} icon={Clock} />
            </div>
            {lead.nextFollowUp && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center text-yellow-800 dark:text-yellow-300">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>Next Follow-up: <strong>{new Date(lead.nextFollowUp).toLocaleDateString()}</strong></span>
                </div>
              </div>
            )}
            {lead.tags?.length && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {lead.tags.map(tag => (
                    <span key={tag} className="badge badge-gray">{tag}</span>
                  ))}
                </div>
              </div>
            )}
            {lead.notes && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Notes</h4>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{lead.notes}</p>
              </div>
            )}
          </div>

          {lead.aiSummary && (
            <div className="card p-6 border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-primary-600" /> AI Summary
                </h3>
                <button onClick={handleAiSummary} className="text-sm text-primary-600 hover:text-primary-700">Regenerate</button>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{lead.aiSummary}</p>
            </div>
          )}

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activities</h3>
              <button onClick={() => setShowActivityForm(true)} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" /> Log Activity
              </button>
            </div>

            {showActivityForm && (
              <form onSubmit={handleActivitySubmit} className="space-y-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Type</label>
                    <select value={activityForm.type} onChange={e => setActivityForm({ ...activityForm, type: e.target.value })} className="input mt-1">
                      <option value="call">Call</option>
                      <option value="email">Email</option>
                      <option value="meeting">Meeting</option>
                      <option value="note">Note</option>
                      <option value="task">Task</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Subject *</label>
                    <input type="text" required value={activityForm.subject} onChange={e => setActivityForm({ ...activityForm, subject: e.target.value })} className="input mt-1" />
                  </div>
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea value={activityForm.description} onChange={e => setActivityForm({ ...activityForm, description: e.target.value })} className="input mt-1" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Duration (min)</label>
                    <input type="number" min="0" value={activityForm.duration} onChange={e => setActivityForm({ ...activityForm, duration: parseInt(e.target.value) || 0 })} className="input mt-1" />
                  </div>
                  <div>
                    <label className="label">Outcome</label>
                    <input type="text" value={activityForm.outcome} onChange={e => setActivityForm({ ...activityForm, outcome: e.target.value })} className="input mt-1" />
                  </div>
                </div>
                <div>
                  <label className="label">Next Follow-up</label>
                  <input type="datetime-local" value={activityForm.nextFollowUp} onChange={e => setActivityForm({ ...activityForm, nextFollowUp: e.target.value })} className="input mt-1" />
                </div>
                <div className="flex space-x-3">
                  <button type="button" onClick={() => setShowActivityForm(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={activityLoading} className="btn-primary">
                    {activityLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log Activity'}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No activities logged yet</p>
              ) : (
                activities.map(activity => (
                  <ActivityItem key={activity._id} activity={activity} />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">Send Email</span>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">Log Call</span>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">Schedule Meeting</span>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">Generate AI Insights</span>
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pipeline Stage</h3>
            <div className="space-y-3">
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <button
                  key={key}
                  className={clsx('w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3',
                    lead.status === key
                      ? `bg-${cfg.color}-100 dark:bg-${cfg.color}-900/30 border border-${cfg.color}-300 dark:border-${cfg.color}-700`
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                  onClick={() => {}}
                >
                  <cfg.icon className={clsx('w-5 h-5', lead.status === key ? `text-${cfg.color}-600` : 'text-gray-400')} />
                  <span className={clsx(lead.status === key ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400')}>
                    {cfg.label}
                  </span>
                  {lead.status === key && <Check className="w-5 h-5 text-green-600 ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start space-x-3">
      <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function ActivityItem({ activity }) {
  const typeIcons = {
    call: Phone,
    email: Mail,
    meeting: Calendar,
    note: MessageSquare,
    task: CheckSquare
  };
  const Icon = typeIcons[activity.type] || MessageSquare;

  return (
    <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <Icon className="w-5 h-5 text-gray-400 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium text-gray-900 dark:text-white">{activity.subject}</p>
          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {new Date(activity.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.description || 'No description'}</p>
        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
          {activity.duration && <span><Clock className="w-3 h-3 inline mr-1" /> {activity.duration} min</span>}
          {activity.outcome && <span>{activity.outcome}</span>}
          {activity.user && <span>By {activity.user.name}</span>}
        </div>
      </div>
    </div>
  );
}