const SalesRep = require('../models/salesRep.model');

// Create a new Sales Representative
exports.createSalesRep = async (req, res) => {
  try {
    const tenantId = req.tenantId || req.params.slug; // Fallback to slug if middleware maps differently
    const repData = { ...req.body, tenantId };
    
    // Auto-generate employeeId if not provided
    if (!repData.employeeId) {
       const count = await SalesRep.countDocuments({ tenantId });
       repData.employeeId = `SR-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
    }

    const salesRep = new SalesRep(repData);
    await salesRep.save();
    
    res.status(201).json({ success: true, data: salesRep, message: 'Sales Representative added successfully!' });
  } catch (error) {
    console.error('Error creating sales rep:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create sales representative.' });
  }
};

// Get all Sales Representatives for a tenant
exports.getAllSalesReps = async (req, res) => {
  try {
    const tenantId = req.tenantId || req.params.slug;
    const salesReps = await SalesRep.find({ tenantId }).populate("memberId","_id name phone email joiningDate").sort({ createdAt: -1 });
    
    // Map data fields to exactly match what the frontend `SalesRep` interface expects
    const mappedReps = salesReps.map(rep => {
        const repObj = rep.toObject();
        return {
            ...repObj,
            id: repObj._id,
            // employeeCode: repObj.employeeId,
            // phone: repObj.mobileNumber,
            status: repObj.status || repObj.employmentStatus,
            territory: repObj.territory || repObj.salesTerritory,
            // avatarUrl: repObj.profileImage,
            // Compute a top performer badge if needed (e.g., achievement > target)
            isTopPerformer: (repObj.achievement > 0 && repObj.achievement >= repObj.monthlyTarget)
        };
    });

    res.status(200).json({ success: true, data: mappedReps });
  } catch (error) {
    console.error('Error fetching sales reps:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sales representatives.' });
  }
};

// Get a single Sales Representative by ID
exports.getSalesRepById = async (req, res) => {
  try {
    const tenantId = req.tenantId || req.params.slug;
    const rep = await SalesRep.findOne({ _id: req.params.id, tenantId });
    
    if (!rep) {
      return res.status(404).json({ success: false, message: 'Sales Representative not found.' });
    }
    
    const repObj = rep.toObject();
    const mappedRep = {
        ...repObj,
        id: repObj._id,
        employeeCode: repObj.employeeCode || repObj.employeeId,
        phone: repObj.phone || repObj.mobileNumber,
        status: repObj.status || repObj.employmentStatus,
        territory: repObj.territory || repObj.salesTerritory,
        avatarUrl: repObj.avatarUrl || repObj.profileImage
    };
    
    res.status(200).json({ success: true, data: mappedRep });
  } catch (error) {
    console.error('Error fetching sales rep:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sales representative.' });
  }
};

// Update a Sales Representative
exports.updateSalesRep = async (req, res) => {
  try {
    const tenantId = req.tenantId || req.params.slug;

    const rep = await SalesRep.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      req.body,
      { new: true, runValidators: true, strict: false }
    );
    
    if (!rep) {
      return res.status(404).json({ success: false, message: 'Sales Representative not found.' });
    }
    
    res.status(200).json({ success: true, data: rep, message: 'Sales Representative updated successfully!' });
  } catch (error) {
    console.error('Error updating sales rep:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update sales representative.' });
  }
};

// Delete a Sales Representative
exports.deleteSalesRep = async (req, res) => {
  try {
    const tenantId = req.tenantId || req.params.slug;
    await SalesRep.findOneAndDelete({ _id: req.params.id, tenantId });
    res.status(200).json({ success: true, message: 'Sales Representative deleted successfully!' });
  } catch (error) {
    console.error('Error deleting sales rep:', error);
    res.status(500).json({ success: false, message: 'Failed to delete sales representative.' });
  }
};