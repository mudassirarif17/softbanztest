import React, { useState, useEffect, Fragment } from 'react';
import ExportPdfDialog from './ExportPdfDialog';
import { Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  CircularProgress,
  Fab,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import BodyModel3D from './BodyModel3D';
import AddPatientRecord from './AddPatientRecord';
import ViewPatientRecord from './ViewPatientRecord';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const API_URL = `${BASE_URL}/api`;

// Function to determine body part based on 3D coordinates
const getBodyPartName = (position) => {
  const { x, y, z } = position;
  console.log('Click coordinates:', { x: x.toFixed(3), y: y.toFixed(3), z: z.toFixed(3) });
  
  // Convert to model space coordinates since the model is scaled and positioned
  const modelY = (y + 0.2) / 0.8; // Reverse the model's position and scale transformations
  
  // Head (sphere at y=1.6, radius=0.12)
  if (modelY >= 1.48) {
    if (Math.abs(x) < 0.12 && Math.abs(z) < 0.12) {
      if (z > 0.06) return 'Back of Head';
      if (z < -0.06) return 'Face';
      return 'Head';
    }
    return 'Neck';
  }
  
  // Neck (cylinder at y=1.45, height=0.1)
  if (modelY >= 1.4) {
    if (Math.abs(x) < 0.05 && Math.abs(z) < 0.05) return 'Neck';
    return 'Shoulder';
  }
  
  // Torso (cylinder at y=1.1, height=0.5, top radius=0.2, bottom radius=0.15)
  if (modelY >= 0.85) {
    // Arms (positioned at ±0.3 x, 1.3 y)
    if (Math.abs(x) >= 0.25) {
      if (modelY >= 1.3) {
        return x > 0 ? 'Right Upper Arm' : 'Left Upper Arm';
      }
      return x > 0 ? 'Right Lower Arm' : 'Left Lower Arm';
    }
    
    // Upper torso
    if (modelY >= 1.2) {
      if (Math.abs(x) < 0.2) {
        return z > 0 ? 'Upper Back' : 'Chest';
      }
    }
    
    // Mid torso
    if (modelY >= 1.0) {
      if (Math.abs(x) < 0.18) {
        return z > 0 ? 'Middle Back' : 'Upper Abdomen';
      }
    }
    
    // Lower torso
    if (Math.abs(x) < 0.15) {
      return z > 0 ? 'Lower Back' : 'Lower Abdomen';
    }
  }
  
  // Legs (cylinders at ±0.1 x, 0.7 y, height=0.5)
  if (modelY >= 0.45) {
    if (x >= 0.07) return z > 0 ? 'Right Back Thigh' : 'Right Front Thigh';
    if (x <= -0.07) return z > 0 ? 'Left Back Thigh' : 'Left Front Thigh';
    return z > 0 ? 'Lower Back' : 'Groin';
  }
  
  // Lower legs
  if (x >= 0.07) return z > 0 ? 'Right Back Leg' : 'Right Front Leg';
  if (x <= -0.07) return z > 0 ? 'Left Back Leg' : 'Left Front Leg';
  return z > 0 ? 'Back of Knees' : 'Front of Knees';
};

const PatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [markers, setMarkers] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportRecord, setExportRecord] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await fetch(`${API_URL}/patients/${id}`);
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to fetch patient data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setPatient(data);
        if (data.markers) {
          setMarkers(data.markers);
        }
      } catch (err) {
        console.error('Error fetching patient:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  const handleMarkerPlaced = async (position) => {
    // Get the body part name from the position
    const bodyPartName = getBodyPartName(position);
    setSelectedBodyPart(bodyPartName);
    setShowAddRecord(true);
    const newMarker = { position, date: new Date().toISOString() };
    const updatedMarkers = [...markers, newMarker];
    setMarkers(updatedMarkers);

    try {
      const response = await fetch(`${API_URL}/patients/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markers: updatedMarkers }),
      });
      if (!response.ok) throw new Error('Failed to update markers');
    } catch (error) {
      console.error('Error saving marker:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (!patient) {
    return (
      <Container>
        <Typography color="error">No patient data found</Typography>
      </Container>
    );
  }

  return (
    <Fragment>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, position: 'relative' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/patients')} size="large">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {patient.firstName} {patient.lastName}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Edit Patient Information">
          <IconButton
            onClick={() => navigate(`/patients?edit=${id}`)}
            size="large"
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Body" />
          <Tab label="History" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {activeTab === 0 ? (
            <Box sx={{ 
                height: '500px',
                width: '100%',
                maxWidth: '700px',
                margin: '0 auto',
                position: 'relative', 
                border: '2px solid #1976d2', 
                borderRadius: '8px',
                backgroundColor: '#f8f9fa',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}>
              <Box sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                right: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1
              }}>
                <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'medium' }}>
                  3D Body Marker Tool
                </Typography>
                <Typography variant="body2" sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0'
                }}>
                  🖱️ Click to add markers • 🔄 Drag to rotate • ⚡ Scroll to zoom
                </Typography>
              </Box>
              <BodyModel3D 
                markers={markers} 
                onMarkerPlaced={handleMarkerPlaced} 
              />
              <Fab
                color="primary"
                sx={{ position: 'absolute', bottom: 16, right: 16 }}
                onClick={() => setShowAddRecord(true)}
              >
                <AddIcon />
              </Fab>
            </Box>
          ) : (
            <Box>
              {/* Export Full History Button */}
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" color="primary">
                  Patient History
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setExportRecord(null);
                    setShowExportDialog(true);
                  }}
                  startIcon={<FileDownloadIcon />}
                >
                  Export Full History
                </Button>
              </Box>
              {/* Display Records */}
              {[...(patient.records || [])]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((record, index) => (
                <Paper
                  key={`record-${index}`}
                  sx={{
                    p: 2,
                    mb: 2,
                    backgroundColor: 'background.default',
                    borderLeft: record.riskLevel === 'high' ? '4px solid #f44336' : 
                              record.riskLevel === 'medium' ? '4px solid #ff9800' : 
                              '4px solid #4caf50',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 3,
                      transition: 'box-shadow 0.2s'
                    }
                  }}
                  onClick={() => setSelectedRecord(record)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setExportRecord(record);
                    setShowExportDialog(true);
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {/* Record Details */}
                    <Box>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {new Date(record.date).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 0.5 }}>
                        <strong>Body Part:</strong> {typeof record.bodyPart === 'object' ? 
                          getBodyPartName(record.bodyPart) : 
                          record.bodyPart}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 0.5 }}>
                        <strong>Reason:</strong> {record.reason}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          mb: 0.5,
                          color: record.riskLevel === 'high' ? '#f44336' : 
                                record.riskLevel === 'medium' ? '#ff9800' : 
                                '#4caf50'
                        }}
                      >
                        <strong>Risk Level:</strong> {record.riskLevel.charAt(0).toUpperCase() + record.riskLevel.slice(1)}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<FileDownloadIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExportRecord(record);
                            setShowExportDialog(true);
                          }}
                          sx={{ minWidth: '120px' }}
                        >
                          Export PDF
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                  {record.icdCodes?.length > 0 && (
                    <Typography variant="body1">
                      <strong>ICD-10 Codes:</strong>{' '}
                      {record.icdCodes.map(code => `${code.code} - ${code.description}`).join(', ')}
                    </Typography>
                  )}
                  {record.notes && (
                    <Typography variant="body1">
                      <strong>Notes:</strong> {record.notes}
                    </Typography>
                  )}
                  {record.images?.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Images:</strong> {record.images.length} photo{record.images.length !== 1 ? 's' : ''}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        overflowX: 'auto',
                        pb: 1
                      }}>
                        {record.images.map((image, imgIndex) => (
                          <Box
                            key={imgIndex}
                            sx={{
                              width: 100,
                              height: 100,
                              flexShrink: 0,
                              borderRadius: 1,
                              overflow: 'hidden',
                              border: '1px solid #ddd',
                              position: 'relative'
                            }}
                          >
                            <img
                              src={`${BASE_URL}${image.url}`}
                              alt={image.name || `Image ${imgIndex + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                console.error('Failed to load thumbnail:', {
                                  url: image.url,
                                  fullUrl: `${BASE_URL}${image.url}`
                                });
                                e.target.src = 'https://via.placeholder.com/100x100?text=Error';
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Paper>
              ))}

              {/* Display History Entries */}
              {patient.history?.map((entry, index) => (
                <Paper
                  key={`history-${index}`}
                  sx={{
                    p: 2,
                    mb: 2,
                    backgroundColor: 'background.default',
                    borderLeft: '4px solid #4caf50'
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    {new Date(entry.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Condition:</strong> {entry.condition}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Location:</strong> {entry.location}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Notes:</strong> {entry.notes}
                  </Typography>
                </Paper>
              ))}

              {(!patient.records?.length && !patient.history?.length) && (
                <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
                  No records or history entries found
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      </Container>

      {showAddRecord && (
        <AddPatientRecord
          onClose={() => {
            setShowAddRecord(false);
            setSelectedBodyPart(null);
          }}
          bodyPart={selectedBodyPart}
          patientId={id}
          onSave={async (savedRecord) => {
            try {
              // Record has already been saved by AddPatientRecord
              console.log('Record saved successfully:', savedRecord);
              
              // Update patient state with new record
              setPatient(prevPatient => ({
                ...prevPatient,
                records: [...(prevPatient.records || []), savedRecord]
              }));
              
              setShowAddRecord(false);
              setSelectedBodyPart(null);
            } catch (err) {
              console.error('Error saving patient record:', err);
              setError('Failed to save patient record');
            }
          }}
        />
      )}

      {selectedRecord && (
        <ViewPatientRecord
          record={selectedRecord}
          open={Boolean(selectedRecord)}
          onClose={() => setSelectedRecord(null)}
          patientId={id}
          onUpdate={(updatedRecord) => {
            const updatedRecords = patient.records.map(r =>
              r._id === updatedRecord._id ? updatedRecord : r
            );
            setPatient({ ...patient, records: updatedRecords });
          }}
          onDelete={(recordId) => {
            const updatedRecords = patient.records.filter(r => r._id !== recordId);
            setPatient({ ...patient, records: updatedRecords });
            setSelectedRecord(null);
          }}
        />
      )}
      {showExportDialog && (
        <ExportPdfDialog
          open={showExportDialog}
          onClose={() => {
            setShowExportDialog(false);
            setExportRecord(null);
          }}
          patientData={patient}
          records={exportRecord ? [exportRecord] : patient.records}
        />
      )}
    </Fragment>
  );
};

export default PatientProfile;
