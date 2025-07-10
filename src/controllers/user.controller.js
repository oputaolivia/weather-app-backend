import responseDto from "../response/response.js";
import UserService from "../services/user.services.js";

const userService = new UserService();
const res = new responseDto();

async function createUserController(request, response, next) {
  try {
    const userCreationResponse = await userService.createUser(request.body);
    const { password, ...user } = userCreationResponse;
    
    res.data = user
    res.message = 'User Created'
    res.status = 201
    response.status(201).json(res);
  } catch (error) {
    next(error);
  }
}

async function userLoginController(request, response, next) {
  try {
    const accessToken = await userService.authenticate(request.body);
    res.data = accessToken
    res.message = 'Login Successful'
    res.status = 200
    response.status(200).json(res);
  } catch (error) {
    next(error);
  }
}

async function getUsersController(request, response, next){
  try {
    const users = await userService.getUsers();
    res.data = users
    res.message = 'Retrieved all Users'
    res.status = 200
    response.status(200).json(res)
  } catch (error) {
    next(error)
  }
}

async function getUserController(request, response, next) {
  try {
    const id = request.params;
    const user = await userService.getUser(id.id);
    res.data = user
    res.message = 'User Retrieved'
    res.status = 200
    response.status(200).json(res)
  } catch (error) {
    next(error)
  }
}

async function updateUserController(request, response, next) {
  try {
    const id = request.params;
    const userId = request.user;

    const updatedUser = await userService.updateUser(id.id, userId.userId, request.body);
    res.data = updatedUser
    res.message = 'User Updated'
    res.status = 201
    response.status(201).json(res)
  } catch (error) {
    next(error)
  }
}

async function deleteUserController(request, response, next) {
  try {
    const id = request.params;
    const userId = request.user;

    const deletedUser = await userService.deleteUser(id.id, userId.userId)
    res.data = deletedUser
    res.message = 'User Deleted'
    res.status = 204
    response.status(204).json(res)
  } catch (error) {
    next(error)
  }
}

async function requestResetPassword (request, response, next) {
  try {
    const {email} = request.body;
    const otp = Math.floor(1000 + Math.random()*9000)
    const otpSentTime = Date.now();
    const payload = {otp, otpSentTime}

    const otpSaved = await userService.saveOtp(payload,email)
    await userService.sendOtp(email, otp)
    res.data = otpSaved;
    res.message = 'OTP Sent, check Inbox or Spam'
    res.status = 200;

    response.status(200).json(res)
  } catch (error) {
    next(error)
  }
}

async function verifiedOtp (request, response, next) {
  try {
    const {otp} = request.body;
    const {email} = request.query;

    const otpVerified = await userService.verifyOtp(otp,email);

    res.data = otpVerified
    res.message = 'OTP Verified'
    res.status = 200

    response.status(200).json(res)
  } catch (error) {
    next(error)
  }
}

async function resetPassword (request, response, next) {
  try {
    const {email, otp} = request.query;
    const {password} = request.body;
    const passwordChanged = await userService.passwordReset(email,password, otp)
    res.data = passwordChanged
    res.message = 'Password Changed'
    res.status = 201

    response.status(201).json(res)
  } catch (error) {
    next(error)
  }
}

export {
  createUserController,
  userLoginController,
  getUsersController,
  getUserController,
  updateUserController,
  deleteUserController,
  requestResetPassword,
  verifiedOtp,
  resetPassword,
};
