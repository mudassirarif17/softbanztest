import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define the structure of the user object (if needed)
interface User {
    id: string;
    email: string;
    // Add other fields as needed
}

// Extend the Request interface to include the user property
declare module 'express' {
    interface Request {
        user?: User;
    }
}

const authenticateToken = (req: Request, res: Response, next: NextFunction) : void | any => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
        if (err) return res.sendStatus(403);

        // Attach the user object to the request
        req.user = user as User;
        next();
    });
};

export default authenticateToken;