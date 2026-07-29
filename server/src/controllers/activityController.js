import { Activity } from '../models/Activity.js';
import { AppError, NotFoundError } from '../utils/errors.js';
import { Lead } from '../models/Lead.js';

export const getActivitiesByLead = async (req, res, next) => {
  try {
    const { leadId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const lead = await Lead.findById(leadId);
    if (!lead) throw new NotFoundError('Lead');

    if (req.user.role !== 'admin' && req.user.role !== 'manager' && lead.assignedTo?.toString() !== req.user.id) {
      throw new AppError('Not authorized', 403);
    }

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      Activity.find({ lead: leadId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('user', 'name avatar')
        .lean(),
      Activity.countDocuments({ lead: leadId })
    ]);

    res.status(200).json({
      success: true,
      count: activities.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

export const createActivity = async (req, res, next) => {
  try {
    const { leadId } = req.params;
    const lead = await Lead.findById(leadId);
    if (!lead) throw new NotFoundError('Lead');

    if (req.user.role !== 'admin' && req.user.role !== 'manager' && lead.assignedTo?.toString() !== req.user.id) {
      throw new AppError('Not authorized', 403);
    }

    const activity = await Activity.create({
      lead: leadId,
      user: req.user.id,
      ...req.body
    });

    await activity.populate('user', 'name avatar');

    lead.lastContacted = new Date();
    if (req.body.nextFollowUp) lead.nextFollowUp = new Date(req.body.nextFollowUp);
    await lead.save();

    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
};

export const updateActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) throw new NotFoundError('Activity');

    if (activity.user.toString() !== req.user.id && !['admin', 'manager'].includes(req.user.role)) {
      throw new AppError('Not authorized', 403);
    }

    Object.assign(activity, req.body);
    await activity.save();
    await activity.populate('user', 'name avatar');

    res.status(200).json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
};

export const deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) throw new NotFoundError('Activity');

    if (!['admin', 'manager'].includes(req.user.role)) {
      throw new AppError('Not authorized', 403);
    }

    await activity.deleteOne();
    res.status(204).json({ success: true });
  } catch (error) {
    next(error);
  }
};