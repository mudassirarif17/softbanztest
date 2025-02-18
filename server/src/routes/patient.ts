import express, { Request, Response } from 'express';
import pool from '../db'; // Remove .js extension
import authenticateToken from '../middleware/auth'; // Remove .js extension

const router = express.Router();

// Define the structure of the patient object
interface Patient {
    id: number;
    firstname: string;
    lastname: string;
    dateofbirth: string;
    gender: string;
    contact_number: string;
    email?: string;
    address: string;
    last_visit?: string;
    condition: string;
    created_by: number;
    shared?: boolean;
    updated_at?: Date;
}

// Route: 1 - Add a new patient
router.post('/add_patient', authenticateToken , async (req: Request, res: Response) : Promise<any> => {
    const { firstname, lastname, dateofbirth, gender, contact_number, email, address, last_visit, condition } = req.body;
    const createdBy = req.user?.id;

    // Check for empty required fields
    if (!firstname || !lastname || !dateofbirth || !gender || !contact_number || !address || !condition) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format (if provided)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateofbirth)) {
        return res.status(400).json({ error: 'Invalid date format for dateofbirth (use YYYY-MM-DD)' });
    }
    if (last_visit && !dateRegex.test(last_visit)) {
        return res.status(400).json({ error: 'Invalid date format for last_visit (use YYYY-MM-DD)' });
    }

    try {
        // Check if patient with the same email already exists
        if (email) {
            const patientExists = await pool.query<Patient>(
                'SELECT * FROM patients WHERE email = $1',
                [email]
            );
            if (patientExists.rows.length > 0) {
                return res.status(400).json({ error: 'Patient already exists with that email' });
            }
        }

        // Insert new patient into the database
        const result = await pool.query<Patient>(
            'INSERT INTO patients (firstname, lastname, dateofbirth, gender, contact_number, email, address, last_visit, condition, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [firstname, lastname, dateofbirth, gender, contact_number, email, address, last_visit, condition, createdBy]
        );

        // Send success response
        res.status(201).json({ message: 'Patient added successfully', patient: result.rows[0] });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Route: 2 - Get all patients (created by user or shared)
router.get('/all_shared_patient', authenticateToken , async (req: Request, res: Response) => {
    const createdBy = req.user?.id;
    try {
        const result = await pool.query<Patient>(
            'SELECT * FROM patients WHERE created_by = $1 OR shared = true',
            [createdBy]
        );
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Route: 3 - Update patient shared status
router.put('/update_patient_shared_status/:id', authenticateToken, async (req: Request, res: Response) => {
    const patientId = req.params.id;
    const { shared } = req.body;
    try {
        const result = await pool.query<Patient>(
            'UPDATE patients SET shared = $1 WHERE id = $2 RETURNING *',
            [shared, patientId]
        );
        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Route: 4 - Delete patient
router.delete('/delete_patient/:id', authenticateToken, async (req: Request, res: Response) : Promise<any> => {
    const patientId = req.params.id;
    try {
        const result = await pool.query<Patient>(
            'DELETE FROM patients WHERE id = $1 RETURNING *',
            [patientId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.json({ message: 'Patient deleted successfully', deletedPatient: result.rows[0] });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Route: 5 - Update patient (all fields)
router.put('/update_patient/:id', authenticateToken, async (req: Request, res: Response) : Promise<any> => {
    const patientId = req.params.id;
    const { firstname, lastname, dateofbirth, gender, contact_number, email, address, last_visit, condition } = req.body;

    // Check if patient ID is provided
    if (!patientId) {
        return res.status(400).json({ error: 'Patient ID is required' });
    }

    // Validate email format (if provided)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateofbirth && !dateRegex.test(dateofbirth)) {
        return res.status(400).json({ error: 'Invalid date format for dateofbirth (use YYYY-MM-DD)' });
    }
    if (last_visit && !dateRegex.test(last_visit)) {
        return res.status(400).json({ error: 'Invalid date format for last_visit (use YYYY-MM-DD)' });
    }

    try {
        // Check if the patient exists
        const patientExists = await pool.query<Patient>(
            'SELECT * FROM patients WHERE id = $1',
            [patientId]
        );
        if (patientExists.rows.length === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Check if the new email is already taken by another patient
        if (email) {
            const emailExists = await pool.query<Patient>(
                'SELECT * FROM patients WHERE email = $1 AND id != $2',
                [email, patientId]
            );
            if (emailExists.rows.length > 0) {
                return res.status(400).json({ error: 'Email already in use by another patient' });
            }
        }

        // Build the SQL query dynamically based on provided fields
        const updateFields = [];
        const updateValues = [];
        let query = 'UPDATE patients SET ';

        if (firstname) {
            updateFields.push('firstname');
            updateValues.push(firstname);
        }
        if (lastname) {
            updateFields.push('lastname');
            updateValues.push(lastname);
        }
        if (dateofbirth) {
            updateFields.push('dateofbirth');
            updateValues.push(dateofbirth);
        }
        if (gender) {
            updateFields.push('gender');
            updateValues.push(gender);
        }
        if (contact_number) {
            updateFields.push('contact_number');
            updateValues.push(contact_number);
        }
        if (email) {
            updateFields.push('email');
            updateValues.push(email);
        }
        if (address) {
            updateFields.push('address');
            updateValues.push(address);
        }
        if (last_visit) {
            updateFields.push('last_visit');
            updateValues.push(last_visit);
        }
        if (condition) {
            updateFields.push('condition');
            updateValues.push(condition);
        }

        // Add updated_at field
        updateFields.push('updated_at');
        updateValues.push(new Date());

        // Construct the query
        query += updateFields.map((field, index) => `${field} = $${index + 1}`).join(', ');
        query += ` WHERE id = $${updateValues.length + 1} RETURNING *`;

        // Execute the query
        const result = await pool.query<Patient>(
            query,
            [...updateValues, patientId]
        );

        // Send success response
        res.status(200).json({ message: 'Patient updated successfully', patient: result.rows[0] });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Route: 6 - Get all patients (only shared)
router.get('/only_shared_patient', authenticateToken, async (req: Request, res: Response) => {
    try {
        const result = await pool.query<Patient>(
            'SELECT * FROM patients WHERE shared = true'
        );
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Route: 7 - All patients added by me (not shared)
router.get('/patient_add_by_me', authenticateToken, async (req: Request, res: Response) => {
    const createdBy = req.user?.id;
    try {
        const result = await pool.query<Patient>(
            'SELECT * FROM patients WHERE created_by = $1 AND shared = false',
            [createdBy]
        );
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Route: 8 - Get a specific patient
router.get('/get_patient/:id', authenticateToken, async (req: Request, res: Response) : Promise<any> => {
    const patientId = req.params.id;

    // Check if patient ID is provided
    if (!patientId) {
        return res.status(400).json({ error: 'Patient ID is required' });
    }

    try {
        const result = await pool.query<Patient>(
            'SELECT * FROM patients WHERE id = $1',
            [patientId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.status(200).json({ message: 'Patient retrieved successfully', patient: result.rows[0] });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;