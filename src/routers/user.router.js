import { Router } from 'express';
import {
  createUserController,
  userLoginController,
  getUserController,
  updateUserController,
  deleteUserController,
  requestResetPassword,
  verifiedOtp,
  resetPassword,
} from '../controllers/user.controller.js';
import { verifyAuth } from '../middlewares/auth.middleware.js';

const userRouter = Router();

userRouter.post('/', createUserController);
userRouter.post('/auth', userLoginController);
userRouter.get('/me', verifyAuth, getUserController);
userRouter.post('/requestPasswordReset', requestResetPassword);
userRouter.post('/verifyOtp', verifiedOtp);
userRouter.patch('/updateUser/:id', verifyAuth, updateUserController);
userRouter.patch('/resetPassword', resetPassword);
userRouter.delete('/deleteUser/:id', verifyAuth, deleteUserController);

export default userRouter;
