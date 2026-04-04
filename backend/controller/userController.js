const UserService = require("../service/userService");
const jwt = require("jsonwebtoken");

const UserController = {
  register: async (req, res) => {
    try {
      const { name, address, email, password, username } = req.body;

      const result = await UserService.register({
        name,
        address,
        email,
        password,
        username
      });

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await UserService.login({ username, password });

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
          username: user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000
      });

      return res.status(200).json({
        message: "Login successful",
        user
      });
    } catch (error) {
      return res.status(401).json({
        message: error.message
      });
    }
  },

  logout: async (req, res) => {
    res.clearCookie("token");
    return res.status(200).json({
      message: "Logged out successfully"
    });
  },

  getProfile: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await UserService.getProfile(id);

      return res.status(200).json(user);
    } catch (error) {
      return res.status(404).json({
        message: error.message
      });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await UserService.getAllUsers();

      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({
        message: error.message
      });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, address, email } = req.body;

      const result = await UserService.updateUser(id, {
        name,
        address,
        email
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

changePassword: async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    const isAdmin = req.user?.role === "admin";

    const result = await UserService.changePassword(
      id,
      oldPassword,
      newPassword,
      isAdmin
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
},

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await UserService.deleteUser(id);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(404).json({
        message: error.message
      });
    }
  }
};

module.exports = UserController;