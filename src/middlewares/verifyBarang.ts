import { NextFunction, Request, Response } from "express";
import Joi from 'joi'

const addDataSchema = Joi.object({
    name: Joi.string().required(),
    category: Joi.string().required(),
    location: Joi.string().required(),
    quantity: Joi.number().min(1).required(),
}).unknown(); // Mengizinkan properti tambahan

const editDataSchema = Joi.object({
    name: Joi.string().optional(),
    category: Joi.string().optional(),
    location: Joi.string().optional(),
    quantity: Joi.number().min(1).optional(),
}).unknown();

const usageReportSchema = Joi.object({
    start_date: Joi.date().required().label("Start Date"),
    end_date: Joi.date().required().greater(Joi.ref("start_date")).label("End Date"),
    group_by: Joi.string()
        .valid("category", "location")
        .required()
        .label("Group By"),
});

export const verifyAddBarang = (request: Request, response: Response, next: NextFunction) => {
    // Buat salinan req.body tanpa properti "user"
    const sanitizedBody = { ...request.body };
    delete sanitizedBody.user;

    const { error } = addDataSchema.validate(sanitizedBody, { abortEarly: false });

    if (error) {
        return response.status(400).json({
            status: false,
            message: error.details.map((it) => it.message).join(", "),
        });
    }
    return next();
};


export const verifyEditBarang = (request: Request, response: Response, next: NextFunction) => {
    const sanitizedBody = { ...request.body };
    delete sanitizedBody.user;

    const { error } = editDataSchema.validate(sanitizedBody, { abortEarly: false });

    if (error) {
        return response.status(400).json({
            status: false,
            message: error.details.map((it) => it.message).join(", "),
        });
    }
    return next();
};

