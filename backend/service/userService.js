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

  // Get all users
  getAllUsers: async () => {
    return await User.getAll();
  },

  // Update user info
  updateUser: async (id, { name, address, email }) => {
    if (!name || !address || !email) {
      throw new Error("Please fill all the fields!");
    }

    const affectedRows = await User.update(id, {
      name,
      address,
      email
    });

    if (affectedRows === 0) {
      throw new Error("User not found or no changes made");
    }

    return {
      message: "User updated successfully"
    };
  },

  changePassword: async (id, oldPassword, newPassword, isAdmin = false) => {
  if (!newPassword) {
    throw new Error("New password is required");
  }

  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }

  // Admin reset: no old password needed
  if (isAdmin) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updatePassword(id, hashedPassword);

    return {
      message: "Password changed successfully",
    };
  }

  // Normal user change: old password required
  if (!oldPassword) {
    throw new Error("Old password and new password are required");
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new Error("Old password is incorrect");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await User.updatePassword(id, hashedPassword);

  return {
    message: "Password changed successfully",
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