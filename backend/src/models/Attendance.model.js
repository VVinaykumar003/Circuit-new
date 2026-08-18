const mongoose = require('mongoose');

const breakSchema = new mongoose.Schema({
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number, default: 0 } // in minutes
}, { _id: false });

const deviceAndLocationSchema = new mongoose.Schema({
  device: String, // e.g., "Chrome on Windows"
  ipAddress: String, // e.g., "192.168.1.101"
  gps: {
    latitude: Number,
    longitude: Number
  }
}, { _id: false });

const attendanceRecordSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY', 'PENDING'], 
    required: true 
  },
  mode: {
    type: String,
    enum: ['office', 'wfh', 'half-day'],
    default: 'office'
  },
  checkIn: { type: Date },
  checkOut: { type: Date },
  remarks: { type: String, default: '' },
  workingHours: { type: Number, default: 0 }, // in minutes
  totalBreak: { type: Number, default: 0 }, // in minutes
  lateBy: { type: Number, default: 0 }, // in minutes
  overtime: { type: Number, default: 0 }, // in minutes
  location: { type: String }, // e.g., "Mumbai Office", "Work From Home"
  approval: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected']
  },
  checkInDetails: deviceAndLocationSchema,
  breaks: [breakSchema],
  isOnBreak: { type: Boolean, default: false }
});

const attendanceSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true }, // MULTI-TENANT
  date: { type: Date, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: false },
  
  records: [attendanceRecordSchema],
  
  totalPresent: { type: Number, default: 0 },
  totalAbsent: { type: Number, default: 0 },
  totalHalfDay: { type: Number, default: 0 },
  totalEmployees: { type: Number, default: 0 },
  
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Manager/Admin who submitted it

}, { timestamps: true });

// Prevent duplicate attendance sheets for the same department on the same date
attendanceSchema.index({ organization: 1, department: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
