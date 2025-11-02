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
      { expiresIn: '15d' }
    );
    return token;
  }