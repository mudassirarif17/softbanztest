import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  CircularProgress,
  FormGroup,
  Divider,
} from '@mui/material';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const ExportPdfDialog = ({ open, onClose, patient, selectedRecord }) => {
  const [loading, setLoading] = useState(false);
  const getRiskIcon = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const [options, setOptions] = useState({
    patientInfo: true,
    visitDetails: true,
    images: true,
    soapNotes: true,
    icdCodes: true,
    imageNotes: true,
    riskTags: true,
  });

  const handleOptionChange = (event) => {
    setOptions({
      ...options,
      [event.target.name]: event.target.checked,
    });
  };

  const generatePDF = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF();
      let yOffset = 20;

      // Helper function to add text and update yOffset
      const addText = (text, size = 12, isBold = false) => {
        doc.setFontSize(size);
        doc.setFont(undefined, isBold ? 'bold' : 'normal');
        doc.text(text, 20, yOffset);
        yOffset += size / 2 + 5;
      };

      // Add title
      addText('DermaVision Patient Report', 20, true);
      yOffset += 10;

      // Add patient details if selected
      if (options.patientInfo) {
        addText('Patient Information', 16, true);
        addText('Name: ' + patient.firstName + ' ' + patient.lastName);
        addText('ID Number: ' + patient.idNumber);
        addText('Date of Birth: ' + new Date(patient.dateOfBirth).toLocaleDateString());
        addText('Gender: ' + patient.gender);
        yOffset += 10;
      }

      // Function to add record details
      const addRecordDetails = async (record) => {
        if (yOffset > 250) {
          doc.addPage();
          yOffset = 20;
        }

        addText('Visit Date: ' + new Date(record.date).toLocaleDateString(), 12);
        addText('Body Part: ' + record.bodyPart, 12);
        addText('Reason for Visit: ' + record.reason, 12);
        addText('Risk Level: ' + record.riskLevel, 12);

        if (options.icdCodes && record.icdCodes?.length > 0) {
          addText('ICD-10 Codes:', 12, true);
          record.icdCodes.forEach(code => {
            addText('  • ' + code.code + ' - ' + code.description, 10);
          });
        }

        if (options.soapNotes && record.soapNotes) {
          addText('SOAP Notes:', 12, true);
          if (record.soapNotes.subjective) addText('Subjective: ' + record.soapNotes.subjective, 10);
          if (record.soapNotes.objective) addText('Objective: ' + record.soapNotes.objective, 10);
          if (record.soapNotes.assessment) addText('Assessment: ' + record.soapNotes.assessment, 10);
          if (record.soapNotes.plan) addText('Plan: ' + record.soapNotes.plan, 10);
        }

        if (options.images && record.images?.length > 0) {
          // Sort images by date if available
          const sortedImages = [...record.images].sort((a, b) => {
            if (a.date && b.date) {
              return new Date(a.date) - new Date(b.date);
            }
            return 0;
          });

          addText('Images:', 12, true);
          if (options.riskTags) {
            addText('Risk Level: ' + getRiskIcon(record.riskLevel) + ' ' + record.riskLevel, 10);
          }
          yOffset += 5;

          for (const image of sortedImages) {
            if (yOffset > 220) {
              doc.addPage();
              yOffset = 20;
            }

            try {
              const img = new Image();
              img.crossOrigin = 'Anonymous';
              img.src = (process.env.REACT_APP_API_URL || 'http://localhost:5002') + image.url;
              
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
              });

              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              
              const imgData = canvas.toDataURL('image/jpeg', 0.75);
              const imgProps = doc.getImageProperties(imgData);
              const pdfWidth = doc.internal.pageSize.getWidth() - 40;
              const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

              doc.addImage(imgData, 'JPEG', 20, yOffset, pdfWidth, pdfHeight);
              
              // Add image notes if enabled
              if (options.imageNotes && image.notes) {
                yOffset += pdfHeight + 5;
                doc.setFontSize(10);
                doc.setFont(undefined, 'italic');
                doc.text('Note: ' + image.notes, 20, yOffset);
              }
              yOffset += pdfHeight + 10;
            } catch (error) {
              console.error('Error adding image to PDF:', error);
              addText('Error loading image', 10);
              yOffset += 10;
            }
          }
        }

        yOffset += 10;
      };

      // Add selected record or all records
      if (selectedRecord) {
        await addRecordDetails(selectedRecord);
      } else {
        const sortedRecords = [...patient.records].sort((a, b) => new Date(b.date) - new Date(a.date));
        for (const record of sortedRecords) {
          await addRecordDetails(record);
        }
      }

      // Save the PDF
      const filename = selectedRecord
        ? patient.lastName + '_' + patient.firstName + '_Record_' + new Date(selectedRecord.date).toISOString().split('T')[0] + '.pdf'
        : patient.lastName + '_' + patient.firstName + '_History_' + new Date().toISOString().split('T')[0] + '.pdf';
      
      doc.save(filename);
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export to PDF</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom color="primary">
            PDF Export Options
          </Typography>
          
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Patient Information
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={options.patientInfo} onChange={handleOptionChange} name="patientInfo" />}
              label="Basic Details (Name, ID, DOB)"
            />
          </FormGroup>

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Visit Details
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={options.visitDetails} onChange={handleOptionChange} name="visitDetails" />}
              label="Visit Information (Date, Body Part, Reason)"
            />
            <FormControlLabel
              control={<Checkbox checked={options.soapNotes} onChange={handleOptionChange} name="soapNotes" />}
              label="SOAP Notes"
            />
            <FormControlLabel
              control={<Checkbox checked={options.icdCodes} onChange={handleOptionChange} name="icdCodes" />}
              label="ICD-10 Codes"
            />
          </FormGroup>

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Images & Annotations
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={options.images} onChange={handleOptionChange} name="images" />}
              label="Include Images"
            />
            <FormControlLabel
              control={<Checkbox checked={options.imageNotes} onChange={handleOptionChange} name="imageNotes" />}
              label="Image Notes & Annotations"
            />
            <FormControlLabel
              control={<Checkbox checked={options.riskTags} onChange={handleOptionChange} name="riskTags" />}
              label="Risk Level Indicators"
            />
          </FormGroup>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={generatePDF}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Generating...' : 'Generate PDF'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportPdfDialog;
