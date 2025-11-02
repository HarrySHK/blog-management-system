import { faker } from "@faker-js/faker";
import { userModel } from "../models/user.js";
import { otpModel } from "../models/otp.js";
import bcrypt from "bcrypt";
import { genOTP } from "../utils/otp.js";

const createAndVerifyUsers = async (numUsers) => {
  try {
    const usersPromise = [];

    for (let i = 0; i < numUsers; i++) {
      // Hashing password
      const hashedPassword = await bcrypt.hash("12345678", 10);

      // Creating a new user
      const user = new userModel({
        emailAddress: faker.internet.email(),
        password: hashedPassword,
        isOTPVerified: false,
        role: "user", // Modify role as needed
      });

      const savedUser = await user.save();

      // Generating OTP
      const OTP = genOTP();

      // Creating an OTP document
      const otp = new otpModel({
        userId: savedUser._id,
        emailAddress: savedUser.emailAddress,
        code: OTP,
        type: "signup",
        expiryTime: new Date(Date.now() + 60000), // 1-minute expiry
      });

      await otp.save();

      // Verifying OTP
      await otpModel.updateOne(
        { emailAddress: savedUser.emailAddress, type: "signup" },
        { isVerified: true }
      );

      // Updating user as OTP verified
      await userModel.updateOne(
        { emailAddress: savedUser.emailAddress },
        { isOTPVerified: true }
      );

      // Deleting OTP document after verification
      await otpModel.deleteOne({ emailAddress: savedUser.emailAddress, type: "signup" });

      usersPromise.push({
        emailAddress: savedUser.emailAddress,
        OTP: OTP,
        role: savedUser.role,
        verified: true,
      });
    }

    console.log("Users created, OTPs verified, and OTP documents deleted successfully:", usersPromise);
    process.exit(1);
  } catch (error) {
    console.error("Error creating and verifying users:", error);
    process.exit(1);
  }
};

export { createAndVerifyUsers };
