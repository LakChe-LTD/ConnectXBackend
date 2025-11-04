// controllers/hotspotController.js
const Hotspot = require('../models/Hotspot');

const createHotspot = async (req, res) => {
  try {
    const { name, ssid, location, bandwidthLimit, maxConnections, hardware } = req.body;

    const hotspot = new Hotspot({
      user: req.userId, // ✅ Correct field name
      name,
      ssid,
      location,
      bandwidthLimit,
      maxConnections,
      hardware
    });

    await hotspot.save();

    res.status(201).json({
      success: true,
      message: 'Hotspot created successfully',
      hotspot
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserHotspots = async (req, res) => {
  try {
    const { status = '', limit = 10, page = 1 } = req.query;

    const query = { user: req.userId }; // ✅ Correct user field
    if (status) query.status = status;

    const hotspots = await Hotspot.find(query)
      .limit(Number(limit))
      .skip((page - 1) * limit)
      .exec();

    const total = await Hotspot.countDocuments(query);

    res.json({
      success: true,
      hotspots,
      pagination: {
        total,
        limit: Number(limit),
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getHotspotById = async (req, res) => {
  try {
    const { id } = req.params;

    const hotspot = await Hotspot.findOne({
      _id: id,
      user: req.userId, // ✅ ensure user owns the hotspot
    }).lean();

    if (!hotspot) {
      return res.status(404).json({
        success: false,
        message: "Hotspot not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      hotspot: {
        id: hotspot._id,
        name: hotspot.name,
        ssid: hotspot.ssid,
        status: hotspot.status,
        location: hotspot.location,
        bandwidthLimit: hotspot.bandwidthLimit,
        maxConnections: hotspot.maxConnections,
        totalBandwidthUsed: hotspot.totalBandwidthUsed,
        totalEarnings: hotspot.totalEarnings,
        hardware: hotspot.hardware,
        createdAt: hotspot.createdAt,
        updatedAt: hotspot.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching hotspot details:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching hotspot details",
    });
  }
};

const startHotspotSetup = async (req, res) => {
  try {
    const { setupCode, qrCode } = req.body;

    // 1️⃣ Validate request input
    if (!setupCode && !qrCode) {
      return res.status(400).json({
        success: false,
        message: "Please provide either a setup code or QR code",
      });
    }

    // 2️⃣ Simulate lookup of a hotspot by setupCode or QR code
    let query = {};
    if (setupCode) query["hardware.macAddress"] = setupCode;
    if (qrCode) query["hardware.macAddress"] = qrCode;

    const hotspot = await Hotspot.findOne(query);

    if (!hotspot) {
      return res.status(404).json({
        success: false,
        message: "No hotspot found for the provided code",
      });
    }

    // 3️⃣ Update hotspot status to “setup_in_progress”
    hotspot.status = "maintenance";
    await hotspot.save();

    // 4️⃣ Send response
    res.json({
      success: true,
      message: "Setup started successfully. Please proceed to configuration.",
      hotspotId: hotspot._id,
      setupStatus: hotspot.status,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// ✅ Complete hotspot setup
const completeHotspotSetup = async (req, res) => {
  try {
    const { setupCode, firmwareVersion } = req.body;

    if (!setupCode) {
      return res.status(400).json({ error: "Setup code is required" });
    }

    const hotspot = await Hotspot.findOne({
      user: req.userId,
      "hardware.macAddress": setupCode,
    });

    if (!hotspot) {
      return res.status(404).json({ error: "Hotspot not found" });
    }

    // Update status and any setup info
    hotspot.status = "online";
    hotspot.hardware.firmwareVersion = firmwareVersion || "1.0.0";
    hotspot.lastSetupCompletedAt = new Date();

    await hotspot.save();

    res.json({
      success: true,
      message: "Hotspot setup completed successfully",
      hotspot,
    });
  } catch (error) {
    console.error("Error completing setup:", error);
    res.status(500).json({ error: error.message });
  }
};
// Scan for Available Hotspots (Mock)
const scanAvailableHotspots = async (req, res) => {
  try {
    // Mock some available hotspots for setup
    const mockHotspots = [
      {
        id: "HSPT-001",
        name: "Hotspot-Alpha",
        ssid: "Setup_WiFi_Alpha",
        signalStrength: -45, // RSSI value
        status: "available",
      },
      {
        id: "HSPT-002",
        name: "Hotspot-Beta",
        ssid: "Setup_WiFi_Beta",
        signalStrength: -52,
        status: "available",
      },
      {
        id: "HSPT-003",
        name: "Hotspot-Gamma",
        ssid: "Setup_WiFi_Gamma",
        signalStrength: -61,
        status: "available",
      },
    ];

    // Optionally, include some real DB hotspots that are offline
    const offlineHotspots = await Hotspot.find({ status: "offline" }).limit(3);

    res.json({
      success: true,
      message: "Nearby hotspots scanned successfully",
      hotspots: [...mockHotspots, ...offlineHotspots],
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// ✅ Get Hotspot Usage Stats (daily, weekly, monthly)
const getHotspotStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { range = "daily" } = req.query; // daily, weekly, or monthly

    const hotspot = await Hotspot.findById(id);
    if (!hotspot) {
      return res.status(404).json({ success: false, message: "Hotspot not found" });
    }

    // Mock usage stats for now (in real life you'd calculate from logs)
    const now = new Date();
    const usageData = [];

    const getRandom = (min, max) => Math.random() * (max - min) + min;

    if (range === "daily") {
      for (let i = 0; i < 7; i++) {
        const day = new Date(now);
        day.setDate(now.getDate() - i);
        usageData.unshift({
          date: day.toISOString().split("T")[0],
          bandwidthUsedGB: getRandom(0.5, 3).toFixed(2),
          earnings: getRandom(5, 20).toFixed(2),
        });
      }
    } else if (range === "weekly") {
      for (let i = 0; i < 4; i++) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - i * 7);
        usageData.unshift({
          week: `Week ${4 - i}`,
          bandwidthUsedGB: getRandom(10, 50).toFixed(2),
          earnings: getRandom(100, 200).toFixed(2),
        });
      }
    } else if (range === "monthly") {
      for (let i = 0; i < 6; i++) {
        const month = new Date(now);
        month.setMonth(now.getMonth() - i);
        usageData.unshift({
          month: month.toLocaleString("default", { month: "short" }),
          bandwidthUsedGB: getRandom(50, 200).toFixed(2),
          earnings: getRandom(500, 1000).toFixed(2),
        });
      }
    }

    res.json({
      success: true,
      hotspotId: id,
      range,
      stats: usageData,
    });
  } catch (error) {
    console.error("🔥 Error fetching hotspot stats:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching hotspot stats",
    });
  }
};
// Rename hotspot
const renameHotspot = async (req, res) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;

    if (!newName || newName.trim() === "") {
      return res.status(400).json({ success: false, message: "New name is required" });
    }

    const hotspot = await Hotspot.findOne({ _id: id, user: req.userId });
    if (!hotspot) {
      return res.status(404).json({ success: false, message: "Hotspot not found or unauthorized" });
    }

    hotspot.name = newName.trim();
    await hotspot.save();

    return res.json({
      success: true,
      message: "Hotspot renamed successfully",
      hotspot
    });
  } catch (error) {
    console.error("Error renaming hotspot:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete hotspot (owner or admin)
const deleteHotspot = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the hotspot
    const hotspot = await Hotspot.findById(id);
    if (!hotspot) {
      return res.status(404).json({ success: false, message: "Hotspot not found" });
    }

    // Check ownership or admin rights
    if (hotspot.user.toString() !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this hotspot"
      });
    }

    // Delete the hotspot
    await hotspot.deleteOne();

    res.json({
      success: true,
      message: "Hotspot deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting hotspot:", error);
    res.status(500).json({ success: false, message: "Server error while deleting hotspot" });
  }
};


module.exports = { 
  createHotspot, 
  getUserHotspots, 
  getHotspotById,
  startHotspotSetup,
  completeHotspotSetup,
  scanAvailableHotspots,
  getHotspotStats,
  renameHotspot,
  deleteHotspot
  
};















