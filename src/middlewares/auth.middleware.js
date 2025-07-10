import { UnAuthorizedExpection} from '../../utils/errors.js';
import jwt from 'jsonwebtoken';
const { JsonWebTokenError } = jwt;

function verifyAuth(request, response, next) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnAuthorizedExpection(
        'You need to login to continue this operation. Please provided your access-token with the authorization header',
      );
    }

    const accessToken = authHeader.split(' ')[1];
    const user = jwt.verify(accessToken, process.env.JWT_SECRET);
    request.user = user;
    next();
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      next(new UnAuthorizedExpection('Session expired, please login again'));
    } else {
      next(error);
    }
  }
}

export { verifyAuth };