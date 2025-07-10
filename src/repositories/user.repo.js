import UserModel from '../models/user.model.js';

export default class UserRepo {
  async createUserRecord(payload) {
    try {
      const { firstName, lastName, email, phoneNumber, password } = payload;
      
      const newUserRecord = new UserModel({
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
      });

      await newUserRecord.save();
      return newUserRecord;
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const userRecord = await UserModel.findOne({ email });
      return userRecord;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      return await UserModel.findOne({ _id: userId }).select('-password');
    } catch (error) {
      throw error;
    }
  }

  async fetchUserRecords() {
    try {
      return await UserModel.find({}).select('-password');
    } catch (error) {
      throw error;
    }
  }

  async userUpdate(userId, payload) {
    try {
      return await UserModel.findByIdAndUpdate(userId, payload,{
        new:true
      });

    } catch (error) {
      throw error
    }
  }

  async userDelete(userId){
    try {
      return await UserModel.findByIdAndDelete({_id: userId});
    } catch (error) {
      throw error
    }
  }
}
