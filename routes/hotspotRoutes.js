// routes/hotspotRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const Hotspot = require("../models/Hotspot");
const {
  createHotspot,
  getUserHotspots,
  getHotspotById,
  startHotspotSetup,
completeHotspotSetup,
scanAvailableHotspots,
 getHotspotStats,
 renameHotspot,
 deleteHotspot
} = require("../controllers/hotspotController");

router.post("/", authenticate, createHotspot);
router.get("/", authenticate, getUserHotspots);
router.get("/:id", authenticate, getHotspotById);
router.post("/setup/complete", authenticate, completeHotspotSetup);
router.get("/setup/available", authenticate, scanAvailableHotspots);
router.post("/:id/rename", authenticate, renameHotspot);
router.delete("/:id", authenticate, deleteHotspot);





// ✅ new setup route
router.post("/setup/complete", authenticate, completeHotspotSetup);
router.get("/:id/stats", authenticate, getHotspotStats);


router.get("/:id/status", authenticate, async (req, res) => {
  try {
    const hotspotId = req.params.id;

    // Find the hotspot by ID
    const hotspot = await Hotspot.findById(hotspotId);

    if (!hotspot) {
      return res.status(404).json({
        success: false,
        message: "Hotspot not found",
      });
    }

    // Simulate real-time data (replace later with actual logic)
    const simulatedUsers = Math.floor(Math.random() * 10); // 0–9 users
    const simulatedSpeed = (Math.random() * 50 + 5).toFixed(2); // 5–55 Mbps

    // Construct the response
    const statusResponse = {
      id: hotspot._id,
      name: hotspot.name,
      status: hotspot.status, // "online" or "offline"
      connectedUsers: simulatedUsers,
      currentSpeedMbps: simulatedSpeed,
      lastUpdated: new Date(),
    };

    res.json({
      success: true,
      message: "Hotspot status retrieved successfully",
      data: statusResponse,
    });
  } catch (error) {
  console.error("🔥 Error fetching hotspot status:", error.message);
  res.status(500).json({
    success: false,
    message: error.message || "Server error while fetching hotspot status",
  });
}

});

module.exports = router;
