require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI);

(async () => {
  await User.create({
    name: "New Admin",
    email: "newadmin@gmail.com",
    password: "admin123",
    role: "admin",
    isApproved: true,
    isActive: true,
  });

  console.log("✅ New admin created");
  process.exit();
})();
