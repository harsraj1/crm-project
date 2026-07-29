import { Lead } from '../models/Lead.js';
import { AppError, NotFoundError } from '../utils/errors.js';
import { publishLeadCreated, publishLeadUpdated, requestAiSummary } from '../kafka/producer.js';
import { Activity } from '../models/Activity.js';

export const getAllLeads = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search, sort = '-createdAt' } = req.query;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      query.assignedTo = req.user.id;
    }

    if (status) query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('assignedTo', 'name email avatar')
        .lean(),
      Lead.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: leads.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: leads
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadStats = async (req, res, next) => {
  try {
    const matchQuery = req.user.role === 'admin' || req.user.role === 'manager' ? {} : { assignedTo: req.user.id };

    const stats = await Lead.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' }
        }
      }
    ]);

    const totalLeads = await Lead.countDocuments(matchQuery);
    const totalValue = await Lead.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, total: { $sum: '$value' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: stats,
        totalLeads,
        totalValue: totalValue[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate({
        path: 'activities',
        populate: { path: 'user', select: 'name avatar' }
      });

    if (!lead) {
      throw new NotFoundError('Lead');
    }

    if (req.user.role !== 'admin' && req.user.role !== 'manager' && lead.assignedTo?._id?.toString() !== req.user.id) {
      throw new AppError('Not authorized', 403);
    }

    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req, res, next) => {
  try {
    const leadData = {
      ...req.body,
      assignedTo: req.body.assignedTo || req.user.id
    };

    const lead = await Lead.create(leadData);
    await lead.populate('assignedTo', 'name email avatar');

    // Publish event to Kafka
    await publishLeadCreated({
      id: lead._id.toString(),
      ...lead.toObject()
    });

    res.status(201).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) throw new NotFoundError('Lead');

    if (req.user.role !== 'admin' && req.user.role !== 'manager' && lead.assignedTo?.toString() !== req.user.id) {
      throw new AppError('Not authorized', 403);
    }

    // Track status change
    const oldStatus = lead.status;
    Object.assign(lead, req.body);
    await lead.save();

    await lead.populate('assignedTo', 'name email avatar');

    // Publish event
    await publishLeadUpdated({
      id: lead.id,
      ...lead.toObject(),
      statusChanged: oldStatus !== lead.status,
      oldStatus,
      newStatus: lead.status
    });

    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) throw new NotFoundError('Lead');

    res.status(204).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const addActivity = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) throw new NotFoundError('Lead');

    const activity = await Activity.create({
      lead: lead._id,
      user: req.user.id,
      ...req.body
    });

    await activity.populate('user', 'name avatar');

    // Update lead's last contacted
    lead.lastContacted = new Date();
    if (req.body.nextFollowUp) lead.nextFollowUp = new Date(req.body.nextFollowUp);
    await lead.save();

    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
};

export const requestAiSummary = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) throw new NotFoundError('Lead');

    // Request AI summary via Kafka
    await requestAiSummary({
      leadId: lead._id.toString(),
      userId: req.user.id,
      leadData: {
        name: lead.name,
        company: lead.company,
        notes: lead.notes,
        status: lead.status,
        value: lead.value
      }
    });

    res.status(202).json({
      success: true,
      message: 'AI summary requested, will be available shortly'
    });
  } catch (error) {
    next(error);
  }
};