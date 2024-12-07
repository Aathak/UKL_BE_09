import { Request, Response, NextFunction } from "express";
import Joi from "joi";

const usageReportValidationSchema = Joi.object({
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().required(),
  group_by: Joi.string().valid("category", "location").required(),
}).unknown()

const borrowAnalysisValidationSchema = Joi.object({
    start_date: Joi.date().iso().required().messages({
      "date.base": "Start date harus berupa tanggal yang valid.",
      "any.required": "Start date wajib diisi.",
    }),
    end_date: Joi.date().iso().required().messages({
      "date.base": "End date harus berupa tanggal yang valid.",
      "any.required": "End date wajib diisi.",
    }),
  }).unknown()

export const validateUsageReport = (req: Request, res: Response, next: NextFunction) => {
  const { error } = usageReportValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: false,
      message: error.details[0].message,
    });
  }
  next();
};

export const borrowAnalysisValidation = (req: Request, res: Response, next: NextFunction) => {
    const { error } = borrowAnalysisValidationSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
      });
    }
    next();
  };