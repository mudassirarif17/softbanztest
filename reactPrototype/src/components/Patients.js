import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientForm from './PatientForm';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5001') + '/api';

const Patients = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        console.log('Fetching from:', `${API_URL}/patients`);
        const response = await fetch(`${API_URL}/patients`);
        
        if (!response.ok) {
          let errorMessage;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message;
          } catch (e) {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
          throw new Error(errorMessage || 'Failed to fetch patients');
        }
        
        const data = await response.json();
        setPatients(data);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    idNumber: '',
    dateOfBirth: '',
    gender: '',
    contactNumber: '',
    email: '',
    address: '',
    medicalAidName: '',
    medicalAidNumber: '',
    condition: '',
    lastVisit: new Date().toISOString().split('T')[0],
  });
  
  const [formErrors, setFormErrors] = useState({});

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setNewPatient({
      firstName: '',
      lastName: '',
      idNumber: '',
      dateOfBirth: '',
      gender: '',
      contactNumber: '',
      email: '',
      address: '',
      medicalAidName: '',
      medicalAidNumber: '',
      condition: '',
      lastVisit: new Date().toISOString().split('T')[0],
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setNewPatient({
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      idNumber: patient.idNumber || '',
      dateOfBirth: patient.dateOfBirth || '',
      gender: patient.gender || '',
      contactNumber: patient.contactNumber || '',
      email: patient.email || '',
      address: patient.address || '',
      medicalAidName: patient.medicalAidName || '',
      medicalAidNumber: patient.medicalAidNumber || '',
      condition: patient.condition || '',
      lastVisit: patient.lastVisit || new Date().toISOString().split('T')[0],
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleDeletePatient = async (patientId) => {
    try {
      const response = await fetch(`${API_URL}/patients/${patientId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete patient');
      setPatients(patients.filter((p) => p._id !== patientId));
    } catch (err) {
      setError(err.message);
    }
  };

  const validateForm = useCallback(() => {
    const errors = {};
    const requiredFields = [
      'firstName',
      'lastName',
      'idNumber',
      'dateOfBirth',
      'gender',
      'contactNumber',
      'email',
      'address'
    ];

    requiredFields.forEach(field => {
      if (!newPatient[field]) {
        errors[field] = 'This field is required';
      }
    });

    if (newPatient.email && !/^\S+@\S+\.\S+$/.test(newPatient.email)) {
      errors.email = 'Invalid email address';
    }

    if (newPatient.idNumber) {
      const isDuplicate = patients.some(
        p => p.idNumber === newPatient.idNumber && p._id !== selectedPatient?._id
      );
      if (isDuplicate) {
        errors.idNumber = 'This ID number is already in use';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [newPatient, patients, selectedPatient]);

  const handleSavePatient = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      if (selectedPatient) {
        // Edit existing patient
        const response = await fetch(`${API_URL}/patients/${selectedPatient._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newPatient),
        });
        if (!response.ok) throw new Error('Failed to update patient');
        const updatedPatient = await response.json();
        setPatients(patients.map((p) => p._id === selectedPatient._id ? updatedPatient : p));
      } else {
        // Add new patient
        const response = await fetch(`${API_URL}/patients`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newPatient),
        });
        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.fields) {
            // Handle missing fields error
            errorData.fields.forEach(field => {
              formErrors[field] = 'This field is required';
            });
            setFormErrors(formErrors);
            throw new Error('Please fill in all required fields');
          }
          throw new Error(errorData.message || 'Failed to create patient');
        }
        const savedPatient = await response.json();
        setPatients([...patients, savedPatient]);
      }
    } catch (err) {
      setError(err.message);
      return;
    }
    setOpenDialog(false);
    navigate('/patients');
  };

  const handleTabChange = (event, newValue) => {
    if (newValue === 1) {
      alert('Feature Coming Soon!');
      setTabValue(0); // Stay on My Patients tab
    } else {
      setTabValue(newValue);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      patient.idNumber.toLowerCase().includes(searchLower) ||
      patient._id.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading patients...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: '#fdeded',
            color: '#5f2120',
          }}
        >
          <Typography>{error}</Typography>
        </Paper>
      )}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="My Patients" />
          <Tab label="Shared Patients" />
        </Tabs>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            My Patients
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleAddPatient}
            sx={{ height: 48 }}
          >
            Create New Patient Profile
          </Button>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by Name or ID Number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <Paper sx={{ mt: 2 }}>
          <List>
            {filteredPatients.map((patient) => (
              <ListItem
                key={patient._id}
                divider
                onClick={() => navigate(`/patients/${patient._id}`)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    cursor: 'pointer',
                  },
                  padding: '16px',
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle1">
                      {patient.firstName} {patient.lastName}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      ID: {patient.idNumber} • Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditPatient(patient);
                    }}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePatient(patient._id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {selectedPatient ? 'Edit Patient' : 'Add New Patient'}
        </DialogTitle>
        <DialogContent>
          <PatientForm
            patient={newPatient}
            onPatientChange={setNewPatient}
            errors={formErrors}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSavePatient} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Patients;
