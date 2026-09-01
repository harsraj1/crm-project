import { Customer } from '../models/Customer.js';
import { AppError, NotFoundError } from '../utils/AppError.js';
import { publishCustomerCreated } from '../../kafka/producer.js';

export const getAllCustomers = async (req, res, next) => {
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
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const [customers, total] = await Promise.all([
      Customer.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('assignedTo', 'name avatar')
        .lean(),
      Customer.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: customers.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: customers
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('assignedTo', 'name email avatar');
    if (!customer) throw new NotFoundError('Customer');
    if (!['admin', 'manager'].includes(req.user.role) && customer.assignedTo?._id?.toString() !== req.user.id) {
      throw new AppError('Not authorized', 403);
    }
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const canAssign = ['admin', 'manager'].includes(req.user.role);
    const assignedTo = canAssign && req.body.assignedTo ? req.body.assignedTo : req.user.id;
    const customer = await Customer.create({ ...req.body, assignedTo });
    await publishCustomerCreated(customer);
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) throw new NotFoundError('Customer');
    if (!['admin', 'manager'].includes(req.user.role) && customer.assignedTo?.toString() !== req.user.id) {
      throw new AppError('Not authorized', 403);
    }
    Object.assign(customer, req.body);
    await customer.save();
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) throw new NotFoundError('Customer');
    if (!['admin', 'manager'].includes(req.user.role) && customer.assignedTo?.toString() !== req.user.id) {
      throw new AppError('Not authorized', 403);
    }
    await customer.deleteOne();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
