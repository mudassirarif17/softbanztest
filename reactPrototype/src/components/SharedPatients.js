import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  IconButton,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const SharedPatients = () => {
  const navigate = useNavigate();
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/patients')} size="large">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Shared Patients
        </Typography>
      </Box>
      <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body1" color="text.secondary">
          This feature is coming soon. You'll be able to view patients shared with you by other healthcare providers.
        </Typography>
      </Paper>
    </Container>
  );
};

export default SharedPatients;
