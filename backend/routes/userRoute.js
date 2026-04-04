const express = require("express");
const router = express.Router();
const UserController = require("../controller/userController");
const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/adminMiddleware");
const loginLimit = require("../middleware/loginLimiter");

// Public routes
router.post("/register", UserController.register);
router.post("/login", loginLimit, UserController.login);

// Protected routes (logged-in users)
router.post("/logout", verifyToken, UserController.logout);

router.get("/me", verifyToken, (req, res) => {
  res.json({
    message: "Authorized",
    user: req.user,
  });
});

// Admin and user
router.put("/:id", verifyToken, UserController.updateUser);
router.get("/:id", verifyToken, UserController.getProfile);
router.put("/:id/change-password", verifyToken, UserController.changePassword);


// Admin-only routes
router.get("/", verifyToken, verifyAdmin, UserController.getAllUsers);
router.delete("/:id", verifyToken, verifyAdmin, UserController.deleteUser);

module.exports = router;