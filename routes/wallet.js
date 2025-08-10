const express = require("express");
const router = express.Router();
const { db } = require("../utils/firebase");

// POST /api/wallet/:id  => update wallet address
router.post("/:id", async (req, res) => {
  try {
    const { wallet_address } = req.body;
    if (!wallet_address) return res.status(400).json({ error: "wallet_address required" });

    const ref = db.collection("users").doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "User not found" });

    await ref.update({ wallet_address });
    res.json({ message: "Wallet updated" });
  } catch (error) {
    console.error("POST /api/wallet/:id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/wallet/:id => ambil wallet address user
router.get("/:id", async (req, res) => {
  try {
    const ref = db.collection("users").doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "User not found" });

    const wallet_address = snap.data().wallet_address || null;
    res.json({ wallet_address });
  } catch (error) {
    console.error("GET /api/wallet/:id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
