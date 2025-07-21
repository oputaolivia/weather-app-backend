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
export const phoneNumberRegex = /^(?:\+234|0)[789][01]\d{8}$/;

export default class UserService {
  async createUser(payload) {
    try {
      let { firstName, lastName, phoneNumber, email, password, state, city, lga } = payload;
      if (email && typeof email === "string") {
        email = email.trim();
      }
      if (phoneNumber && typeof phoneNumber === "string") {
        phoneNumber = phoneNumber.trim();
      }

      if (!firstName || typeof firstName !== "string") {
        throw new InputValidationExpection("Firstname is required");
      }

      if (!lastName || typeof lastName !== "string") {
        throw new InputValidationExpection("Lastname is required");
      }

      // Require at least one of email or phone number
      if (!email && !phoneNumber) {
        throw new InputValidationExpection("Either email or phone number is required");
      }

      // Validate email if provided
      if (email) {
        if (typeof email !== "string" || !emailRegex.test(email)) {
          throw new InputValidationExpection("A valid email address is required");
        }
        // Check if email already exists
        const existingEmailUser = await userRepo.getUserByEmail(email);
        if (existingEmailUser) {
          throw new BadRequestExpection("Email already in use");
        }
      }

      // Validate phone number if provided
      if (phoneNumber) {
        if (typeof phoneNumber !== "string" || !phoneNumberRegex.test(phoneNumber)) {
          throw new InputValidationExpection("A valid phone number is required");
        }
  
        // Check if phone number already exists
        if (userRepo.getUserByPhoneNumber) {
          const existingPhoneUser = await userRepo.getUserByPhoneNumber(phoneNumber);
          if (existingPhoneUser) {
            throw new BadRequestExpection("Phone number already in use");
          }
        }
      }

      if (
        !password ||
        typeof password !== "string" ||
        !passwordRegex.test(password)
      ) {
        throw new InputValidationExpection("A valid password is required");
      }

      // Validate state, city, and lga if provided
      if (state && typeof state !== "string") {
        throw new InputValidationExpection("State must be a valid string");
      }
      if (city && typeof city !== "string") {
        throw new InputValidationExpection("City must be a valid string");
      }
      if (lga && typeof lga !== "string") {
        throw new InputValidationExpection("LGA must be a valid string");
      }

      // Hash password
      const hashedPassword = await argon2.hash(password);

      const HydratedPayload = {
        firstName,
        lastName,
        email,
        phoneNumber,
        location:{
          state: state || "",
          city: city || "",
          lga: lga || "",
        },
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
      let { email, phoneNumber, password } = payload;
      if (email && typeof email === "string") {
        email = email.trim();
      }
      if (phoneNumber && typeof phoneNumber === "string") {
        phoneNumber = phoneNumber.trim();
      }

      // Require at least one of email or phone number
      if ((!email || typeof email !== "string" || !emailRegex.test(email)) && (!phoneNumber || typeof phoneNumber !== "string")) {
        throw new InputValidationExpection("A valid email or phone number is required");
      }

      if (
        !password ||
        typeof password !== "string" ||
        !passwordRegex.test(password)
      ) {
        throw new InputValidationExpection("A valid password is required");
      }

      let userRecord = null;
      if (email && emailRegex.test(email)) {
        userRecord = await userRepo.getUserByEmail(email);
      } else if (phoneNumber) {
        if (userRepo.getUserByPhoneNumber) {
          userRecord = await userRepo.getUserByPhoneNumber(phoneNumber);
        }
      }

      if (!userRecord) {
        throw new NotFoundExpection("User not found");
      }

      // Check password is correct
      const isCorrectPassword = await argon2.verify(
        userRecord.password,
        password
      );

      if (!isCorrectPassword) {
        throw new BadRequestExpection("Incorrect credentials");
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

  // Retrieve Users
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
      const { firstName, lastName, email, phoneNumber, state, city, lga } = payload;
      if (!userRecord) {
        throw new NotFoundExpection("User not found");
      }
      if (id !== userId) {
        throw new UnAuthorizedExpection("You dont have access");
      }

      // If city, state, or lga are present, update the location object in the payload
      if (city || state || lga) {
        payload.location = {
          state: state || userRecord.location?.state || "",
          city: city || userRecord.location?.city || "",
          lga: lga || userRecord.location?.lga || "",
        };
        // Remove top-level city, state, lga to avoid duplication
        delete payload.city;
        delete payload.state;
        delete payload.lga;
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
