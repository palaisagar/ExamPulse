const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected...");

    // Delete old admin accounts
    await User.deleteMany({ role: "admin" });
    console.log("Old admin removed.");

    // Create new admin
    await User.create({
      name: "System Admin",
      email: "ps@gmail.com",
      password: "ps@1982",
      role: "admin",
      isApproved: true,
      isActive: true,
    });

    console.log("New admin created successfully.");
    console.log("Email: ps@gmail.com");
    console.log("Password: ps@1982");
    process.exit();
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
