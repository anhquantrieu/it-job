const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const recruiterSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Tên công ty là bắt buộc"],
      trim: true,
    },
    employeeCount: {
      type: Number,
      required: [true, "Số lượng nhân viên là bắt buộc"],
      min: [1, "Công ty phải có ít nhất 1 nhân viên"],
    },
    website: {
      type: String,
      required: false,
      trim: true,
      match: [
        /^(https?:\/\/)?([\w\-])+\.{1}([a-z]{2,63})([\/\w\.\-]*)*\/?$/,
        "URL không hợp lệ",
      ],
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    logoInfo: {
      url: {
        type: String,
        required: true,
        match: [
          /^(https?:\/\/)?([\w\-])+\.{1}([a-z]{2,63})([\/\w\.\-]*)*\/?$/,
          "URL không hợp lệ",
        ],
      },
      publicId: {
        type: String,
        required: true,
      },
    },
    address: {
      type: String,
      required: [true, "Địa chỉ là bắt buộc"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    jobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobPost",
      },
    ],
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

recruiterSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("Recruiter", recruiterSchema);
