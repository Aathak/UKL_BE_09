import { NextFunction, Request, Response } from "express";
import Joi from "joi";

// Schema validasi untuk peminjaman barang
const borrowSchema = Joi.object({
  user_id: Joi.number().required(),
  item_id: Joi.number().required(),
  quantity: Joi.number().min(1).required(),
  borrow_date: Joi.date().required().messages({
    "date.base": "Borrow Date harus berupa tanggal"
  }),
  return_date: Joi.date().required().messages({
    "date.base": "Return Date harus berupa tanggal"
  }),
}).unknown();

// Schema validasi untuk pengembalian barang
const returnSchema = Joi.object({
  borrow_id: Joi.number().required(),
  return_date: Joi.date().required().messages({
    "date.base": "Return Date harus berupa tanggal"
  }),
}).unknown();

export const validateBorrowRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = borrowSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      status: false,
      message: error.details.map((detail) => detail.message).join(", "),
    });
  }
  next();
};

export const validateReturnRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = returnSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      status: false,
      message: error.details.map((detail) => detail.message).join(", "),
    });
  }
  next();
};
