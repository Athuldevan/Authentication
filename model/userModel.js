const mongoose = require(`mongoose`);
const bcrypt = require("bcrypt");

// Define the User schema - this is like a blueprint for user documents
const userSchema = new mongoose.Schema(
  {
    // User's display name
    name: {
      type: String,
      trim: true,        // Remove extra spaces
      unique: true,      // No two users can have same name
    },

    // User's email address
    email: {
      type: String,
      trim: true,        // Remove extra spaces
      // lowercase : true  // Convert to lowercase (commented out)
    },

    // User's password (will be hashed before saving)
    password: {
      type: String,
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// MIDDLEWARE: Hash password before saving to database
// This runs automatically before saving any user document
userSchema.pre("save", async function (next) {
  // Only hash password if it was modified (not on every save)
  if (!this.isModified("password")) next();
  
  // Hash password with salt rounds of 7
  this.password = await bcrypt.hash(this.password, 7);
  next();
});

// METHOD: Check if provided password matches stored hashed password
userSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Create the User model from the schema
const User = mongoose.model("User", userSchema);
module.exports = User;
