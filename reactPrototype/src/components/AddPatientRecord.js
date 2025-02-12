import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

const riskLevels = [
  { label: '🔴 High Risk', value: 'high' },
  { label: '🟡 Monitor', value: 'monitor' },
  { label: '🟢 Normal', value: 'normal' },
];

const visitReasons = [
  'Mole Mapping',
  'Skin Change',
  'Other'
];

// Common ICD-10 codes for dermatology
const icd10Codes = [
  { code: 'L57.0', description: 'Actinic keratosis' },
  { code: 'D22.9', description: 'Melanocytic nevi, unspecified' },
  { code: 'C43.9', description: 'Malignant melanoma of skin, unspecified' },
  { code: 'L70.0', description: 'Acne vulgaris' },
  { code: 'L40.0', description: 'Psoriasis vulgaris' },
];

const AddPatientRecord = ({ onClose, bodyPart, onSave, patientId }) => {
  const [date, setDate] = useState(new Date());
  const [selectedBodyPart, setSelectedBodyPart] = useState(bodyPart || '');
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [images, setImages] = useState([]);
  const [riskLevel, setRiskLevel] = useState('');
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [notes, setNotes] = useState('');
  const [soapNotes, setSoapNotes] = useState({ subjective: '', objective: '', assessment: '', plan: '' });
  const [showSoapDialog, setShowSoapDialog] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      name: `${selectedBodyPart}${images.length + index + 1}`
    }));
    setImages([...images, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSave = async () => {
    // Validate required fields
    if (!selectedBodyPart || !reason || !riskLevel) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';
      const formData = new FormData();
      
      // Add record data
      const recordData = {
        date: date.toISOString(),
        bodyPart: selectedBodyPart,
        reason: reason === 'Other' ? otherReason : reason,
        riskLevel,
        icdCodes: selectedCodes,
        notes,
        soapNotes: Object.keys(soapNotes).some(key => soapNotes[key]) ? soapNotes : null
      };
      
      formData.append('data', JSON.stringify(recordData));
      
      // Add images
      images.forEach((image, index) => {
        formData.append('images', image.file);
      });
      
      // Save record with images
      try {
        const response = await fetch(`${API_URL}/api/patients/${patientId}/records`, {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Failed to save record');
        }
        
        const savedRecord = await response.json();
        onSave(savedRecord);
      } catch (error) {
        console.error('Error saving record:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Failed to save record. Please try again.');
      return;
    }
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Add Patient Record
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of Record"
                  value={date}
                  onChange={(newDate) => setDate(newDate)}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tagged Body Part"
                value={selectedBodyPart}
                onChange={(e) => setSelectedBodyPart(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Reason for Visit</InputLabel>
                <Select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                >
                  {visitReasons.map((r) => (
                    <MenuItem key={r} value={r}>{r}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {reason === 'Other' && (
                <TextField
                  fullWidth
                  label="Specify Reason"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  sx={{ mt: 2 }}
                />
              )}
            </Grid>

            <Grid item xs={12}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                multiple
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload">
                <Button variant="contained" component="span">
                  Upload Images
                </Button>
              </label>

              <ImageList sx={{ mt: 2 }} cols={4} rowHeight={164}>
                {images.map((image, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={image.preview}
                      alt={image.name}
                      loading="lazy"
                    />
                    <Box sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(0,0,0,0.5)', borderRadius: 1 }}>
                      <Tooltip title="Zoom">
                        <IconButton size="small" onClick={() => setZoomedImage(image)} sx={{ color: 'white' }}>
                          <ZoomInIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove">
                        <IconButton size="small" onClick={() => handleRemoveImage(index)} sx={{ color: 'white' }}>
                          <CloseIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Typography variant="caption" sx={{ position: 'absolute', bottom: 0, left: 0, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', p: 0.5 }}>
                      {image.name}
                    </Typography>
                  </ImageListItem>
                ))}
              </ImageList>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Risk Level</InputLabel>
                <Select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value)}
                  required
                >
                  {riskLevels.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>ICD-10 Codes</InputLabel>
                <Select
                  multiple
                  value={selectedCodes}
                  onChange={(e) => setSelectedCodes(e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((code) => (
                        <Chip
                          key={code.code}
                          label={`${code.code} - ${code.description}`}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {icd10Codes.map((code) => (
                    <MenuItem key={code.code} value={code}>
                      {code.code} - {code.description}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setShowSoapDialog(true)}
              >
                Add SOAP Notes
              </Button>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Record
        </Button>
      </DialogActions>

      {/* SOAP Notes Dialog */}
      <Dialog open={showSoapDialog} onClose={() => setShowSoapDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          SOAP Notes
          <IconButton
            aria-label="close"
            onClick={() => setShowSoapDialog(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subjective"
                  multiline
                  rows={3}
                  value={soapNotes.subjective}
                  onChange={(e) => setSoapNotes({ ...soapNotes, subjective: e.target.value })}
                  placeholder="Patient's symptoms, concerns, and history"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Objective"
                  multiline
                  rows={3}
                  value={soapNotes.objective}
                  onChange={(e) => setSoapNotes({ ...soapNotes, objective: e.target.value })}
                  placeholder="Clinical observations and measurements"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Assessment"
                  multiline
                  rows={3}
                  value={soapNotes.assessment}
                  onChange={(e) => setSoapNotes({ ...soapNotes, assessment: e.target.value })}
                  placeholder="Diagnosis and analysis of findings"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Plan"
                  multiline
                  rows={3}
                  value={soapNotes.plan}
                  onChange={(e) => setSoapNotes({ ...soapNotes, plan: e.target.value })}
                  placeholder="Treatment plan and next steps"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSoapDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              // Only close if at least one field has content
              if (Object.values(soapNotes).some(value => value.trim() !== '')) {
                setShowSoapDialog(false);
              } else {
                alert('Please fill in at least one SOAP note field');
              }
            }}
            variant="contained"
            color="primary"
          >
            Save SOAP Notes
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default AddPatientRecord;
