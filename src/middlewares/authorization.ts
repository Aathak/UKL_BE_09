import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { SECRET } from "../global";

interface JwtPayLoad {
    id: String;
    username: String;
    role: String;
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(` `)[1];

    if (!token) {
        return res.status(403).json({message: `Acess denied. No token provided.`});
    }

    try{
        const secretKey = SECRET || ""
        const decoded = verify(token, secretKey);
        console.log("Decoded token payload:", decoded);
        req.body.user = decoded as JwtPayLoad; //nyimpen data payload
        next();
    } catch (error) {
        return res.status(401).json({message: `Invalid token`})
    }
}

//alowed roles itu isinya roles yang dibolehkan untuk akses trs berupa array
export const verifyRole = (allowedRoles: String[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.body.user;

        if (!user) {
            return res.status(403).json({message: "User not found"});
        }
        
        if (!allowedRoles.includes(user.role)) { 
            //jika ! = tidak, data alow role ny tidak ada didalam role, maka akses ditolak. Klo ada ya di next
            return res 
            .status(403)
            .json({message: "You are not allowed to acess this resource"});
        }
        next();
    }
}