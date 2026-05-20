const mongoose = require('mongoose');

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
  remarks: { type: String, default: '' }
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
  
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Manager/Admin who submitted it
  
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number
  }
}, { timestamps: true });

// Prevent duplicate attendance sheets for the same department on the same date
attendanceSchema.index({ organization: 1, department: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
