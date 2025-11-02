import jwt from 'jsonwebtoken';

export const cookieOptions = {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    sameSite: "none",
    httpOnly: true,
    secure: true,
  };

export const genToken = (userId, email) => {
    const token = jwt.sign(
      {
        userId,
        email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    return token;
  };

export const genRefreshToken = (userId, email) => {
    const token = jwt.sign(
      {
        userId,
        email,
        type: 'refresh',
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    return token;
  };

export const verifyRefreshToken = (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      if (decoded.type !== 'refresh') {
        return null;
      }
      return decoded;
    } catch (error) {
      return null;
    }
  };