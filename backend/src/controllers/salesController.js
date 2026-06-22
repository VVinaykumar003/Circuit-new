// import Order from "../models/order.model.js";
// import mongoose from "mongoose";

const mongoose = require("mongoose")
const Order = require("../models/order.model.js")
const Lead = require("../models/Lead.model.js")
const Account = require("../models/Account.model.js")
const Contact = require("../models/Contact.model.js")


/**
 * Retrieves aggregated sales dashboard data
 * GET /api/:slug/sales/dashboard
 */
 const getSalesDashboardData = async (req, res) => {
  try {
    const { slug } = req.params;

    // Get tenant ID from middleware (req.organization or req.tenantId)
    const tenantId = req.organization?._id || req.tenantId;
    const matchTenant = tenantId 
      ? { tenantId: mongoose.Types.ObjectId.isValid(tenantId) ? new mongoose.Types.ObjectId(tenantId) : tenantId } 
      : {};

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // 1. Aggregate Stats
    const statsAgg = await Order.aggregate([
      { $match: matchTenant },
      {
        $group: {
          _id: null,
          thisMonthSales: { $sum: { $cond: [{ $gte: ["$createdAt", startOfMonth] }, "$grandTotal", 0] } },
          todaySales: { $sum: { $cond: [{ $gte: ["$createdAt", startOfDay] }, "$grandTotal", 0] } },
          totalOrders: { $sum: 1 },
          pendingQuotes: { $sum: { $cond: [{ $eq: ["$status", "Quote"] }, 1, 0] } },
          pendingOrders: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } }
        }
      }
    ]);

    const statsData = statsAgg[0] || {
      thisMonthSales: 0, todaySales: 0, totalOrders: 0, pendingQuotes: 0, pendingOrders: 0
    };

    const formatCurrency = (val) => `₹ ${val.toLocaleString('en-IN')}`;

    // 2. Aggregate Sales by Employee
    const salesByEmployeeAgg = await Order.aggregate([
      { $match: matchTenant },
      { $group: { _id: "$salesOwner", value: { $sum: "$grandTotal" } } },
      { $sort: { value: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $lookup: {
          from: "salesreps",
          localField: "_id",
          foreignField: "_id",
          as: "salesRepDetails"
        }
      },
      {
        $lookup: {
          from: "members",
          localField: "_id",
          foreignField: "_id",
          as: "memberDetails"
        }
      }
    ]);

    const salesByEmployee = salesByEmployeeAgg.map(emp => {
      const user = emp.userDetails && emp.userDetails[0];
      const salesRep = emp.salesRepDetails && emp.salesRepDetails[0];
      const member = emp.memberDetails && emp.memberDetails[0];

      const employeeName = user?.name || user?.fullName || user?.firstName ||
                           salesRep?.fullName || salesRep?.name || salesRep?.firstName ||
                           member?.name || member?.fullName || member?.firstName;

      return {
        name: employeeName || (emp._id ? emp._id.toString() : "Unassigned"),
        value: emp.value
      };
    });

    // 3. Aggregate Weekly Sales
    const weeklySalesAgg = await Order.aggregate([
      { $match: { ...matchTenant, createdAt: { $gte: startOfWeek } } },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          sales: { $sum: "$grandTotal" }
        }
      }
    ]);

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklySales = daysOfWeek.map((day, index) => {
      const dayData = weeklySalesAgg.find(d => d._id === index + 1);
      return { day, sales: dayData ? dayData.sales : 0 };
    });

    const data = {
      stats: [
        { label: "This Month's Sales", value: formatCurrency(statsData.thisMonthSales) },
        { label: "Today's Sales", value: formatCurrency(statsData.todaySales) },
        { label: "Total Orders", value: statsData.totalOrders.toString() },
        { label: "Pending Quotes", value: statsData.pendingQuotes.toString() },
        { label: "Pending Orders", value: statsData.pendingOrders.toString() }
      ],
      salesByEmployee: salesByEmployee.length ? salesByEmployee : [],
      weeklySales,
      // Hardcoded data for elements that require more complex schema context
      salesByProduct: [
        { name: "Product A", value: 4200 },
        { name: "Product B", value: 3100 }
      ],
      salesByRegion: [
        { name: "North", value: 6200 },
        { name: "South", value: 4100 }
      ],
      detailedForecast: [
        { month: "Jan", forecast: 50000, actual: 43000 }
      ],
      briefForecast: [
        { month: "Q1", forecast: 165000, actual: 158000 }
      ]
    };

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Error fetching sales dashboard data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sales dashboard data"
    });
  }
};



module.exports = {
 getSalesDashboardData,
};