const User = require("../models/userModel");
const bcrypt = require("bcrypt");

// Password validation
const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
  return regex.test(password);
};

const UserService = {
  // Register user
  register: async ({ name, address, email, password, username }) => {
    if (!name || !address || !email || !password || !username) {
      throw new Error("Please fill all the fields!");
    }

    if (!validatePassword(password)) {
      throw new Error(
        "Password must be at least 8 characters long, include uppercase, lowercase, and a special character"
      );
    }

    const emailExists = await User.checkEmail(email);
    if (emailExists) {
      throw new Error("Email already exists");
    }

    const userId = await User.create({
      name,
      address,
      email,
      password,
      role: "user",
      username
    });

    return {
      message: "User registered successfully",
      userId
    };
  },
  
  // Login using username
    login: async ({ username, password }) => {
        if (!username || !password) {
            throw new Error("Username and password are required");
        }
        
        const user = await User.findByUsername(username);
        if (!user) {
            throw new Error("Invalid username or password");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            throw new Error("Invalid username or password");
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            username: user.username
        };
    },

  // Get single user profile
  getProfile: async (id) => {
    const user = await User.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },

  // Get single user profile
  getProfile: async (id) => {
    const user = await User.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },

  // Get all users
  getAllUsers: async () => {
    return await User.getAll();
  },

  // Update user info
  updateUser: async (id, { name, address, username }) => {
    if (!name || !address || !username) {
      throw new Error("Please fill all the fields!");
    }

    const affectedRows = await User.update(id, {
      name,
      address,
      username
    });

    if (affectedRows === 0) {
      throw new Error("User not found or no changes made");
    }

    return {
      message: "User updated successfully"
    };
  },

  // Change password
  changePassword: async (id, oldPassword, newPassword) => {
    if (!oldPassword || !newPassword) {
      throw new Error("Old password and new password are required");
    }

    if (!validatePassword(newPassword)) {
      throw new Error(
        "New password must be at least 8 characters long, include uppercase, lowercase, and a special character"
      );
    }

    const user = await User.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    const fullUser = await User.findByEmail(user.email);

    const isMatch = await bcrypt.compare(oldPassword, fullUser.password);

    if (!isMatch) {
      throw new Error("Old password is incorrect");
    }

    await User.updatePassword(id, newPassword);

    return {
      message: "Password updated successfully"
    };
  },

  // Delete user
  deleteUser: async (id) => {
    const affectedRows = await User.delete(id);

    if (affectedRows === 0) {
      throw new Error("User not found");
    }

    return {
      message: "User deleted successfully"
    };
  }
};

module.exports = UserService;