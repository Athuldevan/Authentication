const mongoose = require(`mongoose`);
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
    },

    email: {
      type: String,
      trim: true,
      // lowercase : true
    },

    password: {
      type: String,
    },
  },
  { timestamps: true }
);

// Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  this.password = await bcrypt.hash(this.password, 7);

  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password,this.password)
  
};
const User = mongoose.model("User", userSchema);
module.exports = User;
