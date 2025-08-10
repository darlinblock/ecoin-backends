router.post("/:id", async (req, res) => {
  try {
    const { device_name, platform, browser, ip_address } = req.body;

    const ip =
      ip_address ||
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection.remoteAddress ||
      null;

    const ref = db.collection("users").doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "User not found" });

    await ref.update({
      last_active: admin.firestore.Timestamp.now(),
      ip_address: ip,
      device_name: device_name || null,
      platform: platform || null,
      browser: browser || null,
    });

    res.json({ message: "User active info updated" });
  } catch (error) {
    console.error("POST /api/active/:id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
