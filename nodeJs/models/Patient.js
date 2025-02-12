const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  idNumber: {
    type: String,
    required: true,
    unique: true,
  },
  dateOfBirth: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female'],
  },
  contactNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  medicalAidName: {
    type: String,
  },
  medicalAidNumber: {
    type: String,
  },
  condition: {
    type: String,
  },
  lastVisit: {
    type: String,
  },
  records: [{
    date: {
      type: Date,
      required: true
    },
    bodyPart: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    images: [{
      name: String,
      url: String
    }],
    riskLevel: {
      type: String,
      enum: ['high', 'monitor', 'normal']
    },
    icdCodes: [{
      code: String,
      description: String
    }],
    notes: String,
    soapNotes: {
      subjective: String,
      objective: String,
      assessment: String,
      plan: String
    }
  }],
  markers: [{
    x: Number,
    y: Number,
    date: Date,
    notes: String
  }],
  history: [{
    date: Date,
    condition: String,
    location: String,
    notes: String
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

patientSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
