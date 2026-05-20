const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Personal
  imageUrl: {
    type: String,
    trim: true
  }, 
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false // Do not return password by default
  },
  phone: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  currentAddress: {
    type: String,
    trim: true
  },
  permanentAddress: {
    type: String,
    trim: true
  },

  // Emergency
  emergencyName: {
    type: String,
    trim: true
  },
  emergencyPhone: {
    type: String,
    trim: true
  },
  emergencyRelation: {
    type: String,
    trim: true
  },

  // Identity
  aadhaar: {
    type: String,
    trim: true
  },
  pan: {
    type: String,
    trim: true,
    uppercase: true
  },
  passport: {
    type: String,
    trim: true
  },

  // Employment
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
 
  role: {
    type: String,
    enum: ['owner', 'admin', 'manager', 'employee'],
    default: 'employee'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  designation: {
    type: String,
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  joiningDate: {
    type: Date
  },
  previousCompany: {
    type: String,
    trim: true
  },

  // Financial
  bankName: {
    type: String,
    trim: true
  },
  accountNumber: {
    type: String,
    trim: true
  },
  ifscCode: {
    type: String,
    trim: true,
    uppercase: true
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return ;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);