import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Grid,
  FormHelperText,
} from '@mui/material';

const PatientForm = ({ patient, onPatientChange, errors }) => {
  const handleChange = (field) => (event) => {
    onPatientChange({ ...patient, [field]: event.target.value });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="First Name"
            value={patient.firstName || ''}
            onChange={handleChange('firstName')}
            error={!!errors.firstName}
            helperText={errors.firstName}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Last Name"
            value={patient.lastName || ''}
            onChange={handleChange('lastName')}
            error={!!errors.lastName}
            helperText={errors.lastName}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="ID Number"
            value={patient.idNumber || ''}
            onChange={handleChange('idNumber')}
            error={!!errors.idNumber}
            helperText={errors.idNumber || 'This ID must be unique'}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Date of Birth"
            type="date"
            value={patient.dateOfBirth || ''}
            onChange={handleChange('dateOfBirth')}
            error={!!errors.dateOfBirth}
            helperText={errors.dateOfBirth}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            select
            label="Gender"
            value={patient.gender || ''}
            onChange={handleChange('gender')}
            error={!!errors.gender}
            helperText={errors.gender}
          >
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Contact Number"
            value={patient.contactNumber || ''}
            onChange={handleChange('contactNumber')}
            error={!!errors.contactNumber}
            helperText={errors.contactNumber}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Email Address"
            type="email"
            value={patient.email || ''}
            onChange={handleChange('email')}
            error={!!errors.email}
            helperText={errors.email}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Physical Address"
            multiline
            rows={2}
            value={patient.address || ''}
            onChange={handleChange('address')}
            error={!!errors.address}
            helperText={errors.address}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Medical Aid Name"
            value={patient.medicalAidName || ''}
            onChange={handleChange('medicalAidName')}
          />
          <FormHelperText>Optional</FormHelperText>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Medical Aid Number"
            value={patient.medicalAidNumber || ''}
            onChange={handleChange('medicalAidNumber')}
          />
          <FormHelperText>Optional</FormHelperText>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PatientForm;
