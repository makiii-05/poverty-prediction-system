const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/db");

// ⚠️ ONE-TIME USE ONLY
router.get("/seed-admin", async (req, res) => {
  try {
    const password = "Admin@123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // check if admin already exists
    const [existing] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      ["admin"]
    );

    if (existing.length > 0) {
      return res.json({ message: "Admin already exists" });
    }

    await db.query(
      `INSERT INTO users (name, address, email, username, password, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        "Admin",
        "Manila",
        "admin@gmail.com",
        "admin",
        hashedPassword,
        "admin"
      ]
    );

    res.json({
      message: "Admin created successfully",
      username: "admin",
      password: "Admin@123"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;