const express = require("express");
const router = express.Router();

const AdminActionController = require("../controller/adminActionController");
const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/adminMiddleware");

router.post(
  "/password",
  verifyToken,
  verifyAdmin,
  AdminActionController.verifyPassword
);

module.exports = router;