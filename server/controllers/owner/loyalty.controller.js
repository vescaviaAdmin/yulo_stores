import LoyaltyProgram from '../../models/LoyaltyProgram.js';
import LoyaltyMilestone from '../../models/LoyaltyMilestone.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const getOrCreateProgram = (restaurantId) =>
  LoyaltyProgram.findOneAndUpdate(
    { restaurantId },
    { $setOnInsert: { restaurantId } },
    { upsert: true, new: true }
  );

export const getProgram = asyncHandler(async (req, res) => {
  const program = await getOrCreateProgram(req.restaurant._id);
  sendSuccess(res, 200, 'Loyalty program', { program });
});

export const updateProgram = asyncHandler(async (req, res) => {
  const { name, isActive, pointsPerRupee } = req.body;
  const program = await LoyaltyProgram.findOneAndUpdate(
    { restaurantId: req.restaurant._id },
    { $set: { name, isActive, pointsPerRupee } },
    { upsert: true, new: true }
  );
  sendSuccess(res, 200, 'Loyalty program updated', { program });
});

export const listMilestones = asyncHandler(async (req, res) => {
  const milestones = await LoyaltyMilestone.find({
    restaurantId: req.restaurant._id,
  }).lean();
  sendSuccess(res, 200, 'Milestones', { milestones });
});

export const createMilestone = asyncHandler(async (req, res) => {
  const program = await getOrCreateProgram(req.restaurant._id);
  const milestone = await LoyaltyMilestone.create({
    ...req.body,
    restaurantId: req.restaurant._id,
    programId: program._id,
  });
  sendSuccess(res, 201, 'Milestone created', { milestone });
});

export const updateMilestone = asyncHandler(async (req, res) => {
  const milestone = await LoyaltyMilestone.findOneAndUpdate(
    { _id: req.params.mId, restaurantId: req.restaurant._id },
    { $set: req.body },
    { new: true }
  );
  if (!milestone) throw new ApiError(404, 'NOT_FOUND', 'Milestone not found');
  sendSuccess(res, 200, 'Milestone updated', { milestone });
});

export const deleteMilestone = asyncHandler(async (req, res) => {
  const milestone = await LoyaltyMilestone.findOneAndDelete({
    _id: req.params.mId,
    restaurantId: req.restaurant._id,
  });
  if (!milestone) throw new ApiError(404, 'NOT_FOUND', 'Milestone not found');
  sendSuccess(res, 200, 'Milestone deleted', null);
});
