const bcrypt = require("bcrypt");
const User = require("../models/userModel");

const AdminActionController = {
  verifyPassword: async (req, res) => {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }

      const user = await User.findByIdWithPassword(req.user.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect password" });
      }

      return res.status(200).json({
        success: true,
        message: "Password confirmed"
      });
    } catch (error) {
      console.error("Verify password error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
};

module.exports = AdminActionController;