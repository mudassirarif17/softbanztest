import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  DialogActions,
  MobileStepper,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Add as AddIcon,
  Delete as DeleteIcon,
  DeleteForever as DeleteForeverIcon,
} from '@mui/icons-material';

import { format } from 'date-fns';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const API_ENDPOINT = `${API_URL}/api`;

const ViewPatientRecord = ({ record, open, onClose, onUpdate, onDelete, patientId }) => {
  console.log('Record data:', { record, images: record?.images });
  const [activeStep, setActiveStep] = useState(0);
  const [imageNotes, setImageNotes] = useState((record?.images || []).map(img => img?.notes || ''));
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteImageConfirm, setShowDeleteImageConfirm] = useState(false);
  const maxSteps = record?.images?.length || 0;

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const handleDeleteImage = async () => {
    const updatedImages = record.images.filter((_, index) => index !== activeStep);
    
    try {
      // Using API_URL from component scope
      const response = await fetch(`${API_ENDPOINT}/patients/${patientId}/records/${record._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...record,
          images: updatedImages
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      const updatedRecord = await response.json();
      onUpdate(updatedRecord);
      setShowDeleteImageConfirm(false);
      setActiveStep(prev => Math.min(prev, updatedImages.length - 1));
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleDeleteRecord = async () => {
    try {
      // Using API_URL from component scope
      const response = await fetch(`${API_ENDPOINT}/patients/${patientId}/records/${record._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete record');
      }

      onDelete(record._id);
      onClose();
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const handleAddImageNote = async (imageIndex) => {
    const updatedImages = [...record.images];
    const currentDate = new Date();
    
    if (!updatedImages[imageIndex].notes) {
      updatedImages[imageIndex].notes = [];
    }
    
    updatedImages[imageIndex].notes.push({
      text: newNote,
      date: currentDate.toISOString()
    });

    try {
      // Using API_URL from component scope
      const response = await fetch(`${API_ENDPOINT}/patients/${patientId}/records/${record._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: updatedImages
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update record');
      }

      const updatedRecord = await response.json();
      onUpdate(updatedRecord);
      setNewNote('');
      setShowAddNote(false);
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: `${record.bodyPart}_${record.images.length + 1}`,
      notes: []
    }));

    const updatedImages = [...record.images, ...newImages];

    try {
      // Using API_URL from component scope
      const response = await fetch(`${API_ENDPOINT}/patients/${patientId}/records/${record._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: updatedImages
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update record');
      }

      const updatedRecord = await response.json();
      onUpdate(updatedRecord);
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        View Record - {format(new Date(record.date), 'PPP')}
        <Box sx={{ position: 'absolute', right: 8, top: 8, display: 'flex', gap: 1 }}>
          <Tooltip title="Delete Record">
            <IconButton
              aria-label="delete record"
              onClick={() => setShowDeleteConfirm(true)}
              color="error"
            >
              <DeleteForeverIcon />
            </IconButton>
          </Tooltip>
          <IconButton
            aria-label="close"
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ maxWidth: 600, margin: '0 auto' }}>
          {record.images.length > 0 ? (
            <>
              <Box sx={{ position: 'relative', width: '100%', height: 400 }}>
                {record.images.length > 0 && (
                  <Tooltip title="Delete Current Image">
                    <IconButton
                      aria-label="delete image"
                      onClick={() => setShowDeleteImageConfirm(true)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        },
                      }}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {(record?.images || []).map((image, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: index === activeStep ? 1 : 0,
                      transition: 'opacity 0.5s ease-in-out',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 2
                    }}
                  >
                    {image && image.url ? (
                      <img
                        src={`${API_URL}${image.url}`}
                        alt={image.name || 'Patient record image'}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                        }}
                        onError={(e) => {
                          console.error('Failed to load image:', {
                            name: image.name,
                            url: image.url,
                            attemptedUrl: `${API_URL}${image.url}`,
                            apiUrl: API_URL,
                            record: record
                          });
                          e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: '400px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: '#f5f5f5',
                        }}
                      >
                        <Typography variant="body1" color="textSecondary">
                          No image available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
              <MobileStepper
                steps={maxSteps}
                position="static"
                activeStep={activeStep}
                nextButton={
                  <Button
                    size="small"
                    onClick={handleNext}
                    disabled={activeStep === maxSteps - 1}
                  >
                    Next
                    <KeyboardArrowRight />
                  </Button>
                }
                backButton={
                  <Button
                    size="small"
                    onClick={handleBack}
                    disabled={activeStep === 0}
                  >
                    <KeyboardArrowLeft />
                    Back
                  </Button>
                }
              />
              
              {/* Image Notes Section */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Image Notes
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => setShowAddNote(true)}
                    sx={{ ml: 2 }}
                  >
                    Add Note
                  </Button>
                </Typography>
                
                {record.images[activeStep].notes?.map((note, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(note.date), 'PPP p')}
                    </Typography>
                    <Typography variant="body1">
                      {note.text}
                    </Typography>
                  </Paper>
                ))}

                {showAddNote && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      label="Add a note about this image"
                    />
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() => handleAddImageNote(activeStep)}
                      >
                        Save Note
                      </Button>
                      <Button
                        onClick={() => {
                          setShowAddNote(false);
                          setNewNote('');
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </>
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
              No images in this record
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="add-image-button"
          type="file"
          multiple
          onChange={handleImageUpload}
        />
        <label htmlFor="add-image-button">
          <Button
            component="span"
            startIcon={<AddIcon />}
          >
            Add More Photos
          </Button>
        </label>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
      {/* Delete Image Confirmation Dialog */}
      <Dialog
        open={showDeleteImageConfirm}
        onClose={() => setShowDeleteImageConfirm(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Image</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            Are you sure you want to delete this image? This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteImageConfirm(false)}>Cancel</Button>
          <Button onClick={handleDeleteImage} color="error" variant="contained">
            Delete Image
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Record Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Record</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            Are you sure you want to delete this entire record? This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button onClick={handleDeleteRecord} color="error" variant="contained">
            Delete Record
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default ViewPatientRecord;
