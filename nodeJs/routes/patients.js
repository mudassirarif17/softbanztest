const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Get all patients
router.get('/', async (req, res) => {
  try {
    const data = req.app.locals.data;
    if (!data || !data.patients) {
      console.error('No data found:', data);
      return res.status(500).json({ message: 'Database not initialized properly' });
    }
    res.json(data.patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch patients' });
  }
});

// Get single patient
router.get('/:id', async (req, res) => {
  try {
    const data = req.app.locals.data;
    const patient = data.patients.find(p => p._id === req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create patient
router.post('/', async (req, res) => {
  try {
    const data = req.app.locals.data;
    const patientData = req.body;

    if (!patientData) {
      return res.status(400).json({ message: 'No patient data provided' });
    }

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'idNumber', 'dateOfBirth', 'gender'];
    const missingFields = requiredFields.filter(field => !patientData[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        fields: missingFields 
      });
    }

    // Check for duplicate ID number
    const existingPatient = data.patients.find(p => p.idNumber === patientData.idNumber);
    if (existingPatient) {
      return res.status(400).json({ message: 'Patient with this ID number already exists' });
    }

    // Create new patient
    const newPatient = {
      _id: uuidv4(),
      ...patientData,
      records: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.patients.push(newPatient);
    req.app.locals.saveData(data);
    
    res.status(201).json(newPatient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update patient
router.patch('/:id', async (req, res) => {
  try {
    const data = req.app.locals.data;
    const patientIndex = data.patients.findIndex(p => p._id === req.params.id);
    
    if (patientIndex === -1) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check for duplicate ID number if it's being updated
    if (req.body.idNumber && req.body.idNumber !== data.patients[patientIndex].idNumber) {
      const existingPatient = data.patients.find(p => p.idNumber === req.body.idNumber);
      if (existingPatient) {
        return res.status(400).json({ message: 'Patient with this ID number already exists' });
      }
    }

    // Update patient
    data.patients[patientIndex] = {
      ...data.patients[patientIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    req.app.locals.saveData(data);
    res.json(data.patients[patientIndex]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete patient
router.delete('/:id', async (req, res) => {
  try {
    const data = req.app.locals.data;
    const patientIndex = data.patients.findIndex(p => p._id === req.params.id);
    
    if (patientIndex === -1) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Delete patient's images
    const patient = data.patients[patientIndex];
    for (const record of patient.records) {
      if (record.images) {
        for (const image of record.images) {
          try {
            await fs.unlink(path.join(__dirname, '..', image.url));
          } catch (err) {
            console.error('Error deleting image file:', err);
          }
        }
      }
    }

    // Remove patient from data
    data.patients.splice(patientIndex, 1);
    req.app.locals.saveData(data);

    res.json({ message: 'Patient deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload image for patient record
router.post('/:patientId/records/:recordId/images', (req, res) => {
  const upload = req.app.locals.upload;
  
  upload.array('images', 10)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { patientId, recordId } = req.params;
      const data = req.app.locals.data;
      
      const patient = data.patients.find(p => p._id === patientId);
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }

      const record = patient.records.find(r => r._id === recordId);
      if (!record) {
        return res.status(404).json({ message: 'Record not found' });
      }

      // Add uploaded images to the record
      const uploadedImages = req.files.map(file => ({
        url: `/api/uploads/images/${file.filename}`,
        name: file.originalname
      }));

      record.images = [...(record.images || []), ...uploadedImages];
      req.app.locals.saveData(data);

      res.json(uploadedImages);
    } catch (error) {
      console.error('Error handling image upload:', error);
      res.status(500).json({ message: error.message });
    }
  });
});

// Add patient record
router.post('/:id/records', async (req, res) => {
  try {
    const data = req.app.locals.data;
    const patientIndex = data.patients.findIndex(p => p._id === req.params.id);
    
    if (patientIndex === -1) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Handle file uploads
    const upload = req.app.locals.upload;
    
    upload.array('images', 10)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      try {
        // Parse the record data from the form
        const recordData = JSON.parse(req.body.data);
        console.log('Received record data:', recordData);

        // Validate required fields
        if (!recordData.date || !recordData.bodyPart || !recordData.reason || !recordData.riskLevel) {
          return res.status(400).json({ message: 'Missing required fields' });
        }

        // Process uploaded images
        const uploadedImages = [];
        if (req.files && req.files.length > 0) {
          for (const file of req.files) {
            try {
              // Ensure the file exists
              await fs.access(file.path);
              uploadedImages.push({
                url: `/api/uploads/images/${file.filename}`,
                name: file.originalname
              });
              console.log('Saved image:', {
                path: file.path,
                url: `/api/uploads/images/${file.filename}`,
                name: file.originalname
              });
            } catch (error) {
              console.error(`Error processing file ${file.originalname}:`, error);
            }
          }
        }

        // Create a new record with the validated data
        const newRecord = {
          _id: uuidv4(),
          date: new Date(recordData.date).toISOString(),
          bodyPart: recordData.bodyPart,
          reason: recordData.reason,
          images: uploadedImages,
          riskLevel: recordData.riskLevel,
          icdCodes: recordData.icdCodes || [],
          notes: recordData.notes || '',
          soapNotes: recordData.soapNotes || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          patientId: req.params.id
        };

        // Add the new record
        if (!data.patients[patientIndex].records) {
          data.patients[patientIndex].records = [];
        }
        data.patients[patientIndex].records.push(newRecord);
        
        // Save the updated data
        req.app.locals.saveData(data);
        res.status(201).json(newRecord);
      } catch (error) {
        console.error('Error processing record data:', error);
        res.status(400).json({ message: error.message });
      }
    });
  } catch (error) {
    console.error('Error saving patient record:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update patient record
router.patch('/:patientId/records/:recordId', async (req, res) => {
  try {
    const { patientId, recordId } = req.params;
    const updateData = req.body;
    const data = req.app.locals.data;

    const patientIndex = data.patients.findIndex(p => p._id === patientId);
    if (patientIndex === -1) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Find the record to update
    const recordIndex = data.patients[patientIndex].records.findIndex(r => r._id === recordId);
    if (recordIndex === -1) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Update the record
    data.patients[patientIndex].records[recordIndex] = {
      ...data.patients[patientIndex].records[recordIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    req.app.locals.saveData(data);
    res.json(data.patients[patientIndex].records[recordIndex]);
  } catch (error) {
    console.error('Error updating patient record:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete patient record
router.delete('/:patientId/records/:recordId', async (req, res) => {
  try {
    const { patientId, recordId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Find and remove the record
    const recordIndex = patient.records.findIndex(r => r._id.toString() === recordId);
    if (recordIndex === -1) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Remove the record
    patient.records.splice(recordIndex, 1);
    await patient.save();

    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient record:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
