import { NextFunction, Request, Response } from "express";
import Joi from 'joi'
import { profile } from "node:console";
import { describe } from "node:test";

const addDataSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('Admin', 'User').required()
})

const editDataSchema = Joi.object({
    username: Joi.string().optional(),
    password: Joi.string().min(8).optional(),
    role: Joi.string().valid('Admin', 'User').optional()
})

const authSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(3).alphanum(),
  });
  
  export const verifyAuthentication = (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { error } = authSchema.validate(request.body, { abortEarly: false });
  
    if (error) {
      return response.status(400).json({
        status: false,
        message: error.details.map((it) => it.message).join(),
      });
    }
    return next();
  };

export const verifyAddUser = ( request: Request, response: Response, next: NextFunction) => {
    const { error } = addDataSchema.validate( request.body, {abortEarly: false})

    if (error) {
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join() //join ny berupa function, jgn lupa bukatutup
        })
    }
    return next()
}

export const verifyEditUser = ( request: Request, response: Response, next: NextFunction) => {
        const { error } = editDataSchema.validate( request.body, {abortEarly: false})

    if (error) {
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join() //join ny berupa function, jgn lupa bukatutup
        })
    }
    return next()
}
