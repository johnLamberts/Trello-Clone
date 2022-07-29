import { NextFunction, Response } from "express";
import { secretPrivateKey } from "../config";
import jwt from 'jsonwebtoken';
import UserModel from '../models/user'
import { ExpressRequestInterface } from "../types/expressRequest.interface";

export default async (req: ExpressRequestInterface, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader) {
            return res.sendStatus(401);
        }

        const token = authHeader.split(' ')[1];
        const data = jwt.verify(token, secretPrivateKey) as { id: string; email: string};
        const user = await UserModel.findById(data.id);

        if(!user) {
            return res.sendStatus(401);
        }
        req.user = user;
        next();
    } catch (err) {
        res.sendStatus(401);
    }
};