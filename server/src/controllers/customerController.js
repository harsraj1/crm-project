import { Customer } from '../models/Customer.js';
import { AppError, NotFoundError } from '../utils/errors.js';
import { publishCustomerCreated } from '../kafka/producer.js';

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
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.create({ ...req.body, assignedTo: req.body.assignedTo || req.user.id });
    await publishCustomerCreated(customer);
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!customer) throw new NotFoundError('Customer');
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) throw new NotFoundError('Customer');
    res.status(204).json({ success: true });
  } catch (error) {
    next(error);
  }
};