import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db'; 

const router = express.Router();

// Define the structure of the user object
interface User {
    id: number;
    username: string;
    password: string;
}

// Route: 1 - Register a new user
router.post('/register', async (req: Request, res: Response) : Promise<any> => {
    const { username, password } = req.body;

    // Check for empty fields
    if (!username || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if username already exists
        const userExists = await pool.query<User>(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists with that name' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into the database
        const result = await pool.query<User>(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
            [username, hashedPassword]
        );

        // Send success response
        res.status(201).json({ message: 'User created successfully', id: result.rows[0].id });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});




// Route: 2 - Login a user
router.post('/login', async (req: Request, res: Response): Promise<any> => {
    const { username, password } = req.body;

    // Check for empty fields
    if (!username || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if user exists by username
        const result = await pool.query<User>(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'User not found with that username' });
        }

        const user = result.rows[0];

        // Check if password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        // Send success response with token
        res.json({ token });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;