import {
  BadRequestExpection,
  InputValidationExpection,
  NotFoundExpection,
  UnAuthorizedExpection,
} from "../../utils/errors.js";
import UserRepo from "../repositories/user.repo.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { dispatchMail } from "./email.services.js";
import dotenv from "dotenv";

dotenv.config();

export const userRepo = new UserRepo();
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/;

export default class UserService {
  async createUser(payload) {
    try {
      let { firstName, lastName, phoneNumber, email, password } = payload;
      email = email.trim();

      if (!firstName || typeof firstName !== "string") {
        throw new InputValidationExpection("Firstname is required");
      }

      if (!lastName || typeof lastName !== "string") {
        throw new InputValidationExpection("Lastname is required");
      }

      if (!email || typeof email !== "string" || !emailRegex.test(email)) {
        throw new InputValidationExpection("A valid email address is required");
      }

      if (!phoneNumber || typeof phoneNumber !== "string") {
        throw new InputValidationExpection("Phone Number is required");
      }

      if (
        !password ||
        typeof password !== "string" ||
        !passwordRegex.test(password)
      ) {
        throw new InputValidationExpection("A valid password is required");
      }

      // Check if user exist already
      const userRecord = await userRepo.getUserByEmail(email);

      if (userRecord) {
        throw new BadRequestExpection("User account already exist");
      }

      // Hash password
      const hashedPassword = await argon2.hash(password);

      const HydratedPayload = {
        firstName,
        lastName,
        email,
        phoneNumber,
        password: hashedPassword,
      };

      const newUser = await userRepo.createUserRecord(HydratedPayload);

      // await dispatchMail(email, "Welcome To Weather App", {userName: firstName}, "welcome");
      // console.log(sent)
      return newUser.toObject();
    } catch (error) {
      throw error;
    }
  }

  // User login
  async authenticate(payload) {
    try {
      let { email, password } = payload;
      email = email.trim();

      if (!email || typeof email !== "string" || !emailRegex.test(email)) {
        throw new InputValidationExpection("A valid email address is required");
      }

      if (
        !password ||
        typeof password !== "string" ||
        !passwordRegex.test(password)
      ) {
        throw new InputValidationExpection("A valid password is required");
      }

      const userRecord = await userRepo.getUserByEmail(email)

      if (!userRecord) {
        throw new NotFoundExpection("Invalid Credentials");
      }

      // Check password is correct
      const isCorrectPassword = await argon2.verify(
        userRecord.password,
        password
      );

      if (!isCorrectPassword) {
        throw new BadRequestExpection("Invalid credentials");
      }

      // Hydrated payload to select custom fields to encrypt
      const HydratedUserPayload = {
        userId: userRecord._id,
        firstName: userRecord.firstName,
      };

      const accessToken = jwt.sign(
        HydratedUserPayload,
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      return accessToken;
    } catch (error) {
      throw error;
    }
  }

  // Retrieve User
  async getUsers() {
    try {
      const usersRecord = await userRepo.fetchUserRecords();

      return usersRecord;
    } catch (error) {
      throw error;
    }
  }

  // Retrieve a single User
  async getUser(userId) {
    try {
      const userRecord = await userRepo.getUserById(userId);

      if (!userRecord) {
        throw new NotFoundExpection("User not found");
      }
      return userRecord;
    } catch (error) {
      throw error;
    }
  }

  // Update user
  async updateUser(id, userId, payload) {
    try {
      const userRecord = await userRepo.getUserById(userId);
      if (!userRecord) {
        throw new NotFoundExpection("User not found");
      }
      if (id !== userId) {
        throw new UnAuthorizedExpection("You dont have access");
      }

      const updatedUserRecord = await userRepo.userUpdate(userId, payload);

      return updatedUserRecord;
    } catch (error) {
      throw error;
    }
  }

  // Delete User
  async deleteUser(id, userId) {
    try {
      const userRecord = await userRepo.getUserById(userId);
      if (!userRecord) {
        throw new NotFoundExpection("User not found");
      }
      if (id !== userId) {
        throw new UnAuthorizedExpection("You dont have access");
      }

      const deletedUserRecord = await userRepo.userDelete(userId);
      return deletedUserRecord;
    } catch (error) {
      throw error;
    }
  }

  async saveOtp(payload, email) {
    try {
      const userRecord = await userRepo.getUserByEmail(email)
      if (!userRecord) {
        throw new NotFoundExpection("Email does not exist");
      }

      const updateUserOtp = await userRepo.userUpdate(userRecord._id, payload)
      return updateUserOtp;
    } catch (error) {
      throw error;
    }
  }

  async sendOtp(email, otp) {
    try {
      const userRecord = await userRepo.getUserByEmail(email)
      if (!userRecord) {
        throw new NotFoundExpection("Email does not exist");
      }
      const name = userRecord.firstName;
      // const sent = await dispatchMail(email,"OTP- Weather App", {userName:userRecord.firstName, otp: otp}, "otp")
      // console.log(sent)
      return sent
    } catch (error) {
      throw error;
    }
  }

  async verifyOtp(otp, email) {
    try {
      const userRecord = await userRepo.getUserByEmail(email)
      if (!userRecord) {
        throw new NotFoundExpection("Email does not exist");
      }

      const currentTime = Date.now() / 1000;
      const existingTime = userRecord.otpSentTime / 1000;
      const expiryTime = existingTime + 60; //expires in 60s

      if (currentTime > expiryTime) {
        throw new InputValidationExpection("Token Expired");
      }

      if (userRecord.otp != otp) {
        throw new InputValidationExpection("Incorrect OTP");
      }

      return "OTP Code Correct";
    } catch (error) {
      throw error;
    }
  }

  async passwordReset(email, password, otp) {
    try {
      const userRecord = await userRepo.getUserByEmail(email)

      const currentTime = Date.now() / 1000;
      const existingTime = userRecord.otpSentTime / 1000;
      const expiryTime = existingTime + 60; //expires in 60s

      if (currentTime > expiryTime) {
        throw new InputValidationExpection("Token Expired");
      }

      if (userRecord.otp != otp) {
        throw new InputValidationExpection("Incorrect OTP");
      }

      if (!userRecord) {
        throw new NotFoundExpection("Email does not exist");
      }

      if (
        !password ||
        typeof password !== "string" ||
        !passwordRegex.test(password)
      ) {
        throw new InputValidationExpection("A valid password is required");
      }

      const hashedPassword = await argon2.hash(password);
      const updateUserpassword = await userRepo.userUpdate(userRecord._id, {password: hashedPassword});

      return updateUserpassword;
    } catch (error) {
      throw error;
    }
  }
}
