import Joi from 'joi';
import mongoose from 'mongoose';

const objectIdValidation = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message('Invalid ObjectId format');
  }
  return value;
};

export const serviceParamSchema = Joi.object({
  serviceId: Joi.string().custom(objectIdValidation, 'ObjectId Validation').required(),
});

export const updateNoteSchema = Joi.object({
  note: Joi.string().trim().max(300).allow('').required(),
});

export default {
  serviceParamSchema,
  updateNoteSchema,
};
