const express = require("express");
const router = express.Router();
const { admin, db } = require("../utils/firebase");

// POST /api/user  => create or update user profile (telegram webapp init data)
router.post("/", async (req, res) => {
  try {
    const {
      telegram_id,
      username,
      first_name,
      last_name,
      profile_url,
      refcode,
      invited_by,
    } = req.body;

    if (!telegram_id) return res.status(400).json({ error: "telegram_id required" });

    const userRef = db.collection("users").doc(telegram_id);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      const newUser = {
        telegram_id,
        username: username ? `@${username}` : "ECoiner",
        first_name: first_name || "",
        last_name: last_name || "",
        profile_url: profile_url || null,
        wallet_address: null,
        balance_wallet: 0,
        balance_mining: 0,
        hashrate: 0.01,
        refcode: refcode || `ECO${telegram_id}`,
        invited_by: invited_by || null,
        ref_count: 0,
        ref_active: 0,
        mining_start_time: admin.firestore.Timestamp.now(),
        created_at: admin.firestore.Timestamp.now(),
        last_active: admin.firestore.Timestamp.now(),
      };
      await userRef.set(newUser);
      return res.json({ message: "User created", user: newUser });
    } else {
      const updateData = {
        username: username ? `@${username}` : userSnap.data().username,
        first_name: first_name || userSnap.data().first_name,
        last_name: last_name || userSnap.data().last_name,
        profile_url: profile_url || userSnap.data().profile_url,
        last_active: admin.firestore.Timestamp.now(),
      };
      await userRef.update(updateData);
      return res.json({ message: "User updated", user: { ...userSnap.data(), ...updateData } });
    }
  } catch (error) {
    console.error("POST /api/user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/user/:id => ambil data user profile lengkap (termaksud wallet dan balance)
router.get("/:id", async (req, res) => {
  try {
    const ref = db.collection("users").doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "User not found" });
    res.json(snap.data());
  } catch (error) {
    console.error("GET /api/user/:id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
