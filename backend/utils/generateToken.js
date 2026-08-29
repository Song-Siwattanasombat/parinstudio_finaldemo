import jwt from 'jsonwebtoken';

const SESSION_MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;

const generateToken = (res, userId) => {
const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: '3d',
    });

    // Set token in HTTP-only cookie
    res.cookie ('jwt', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'strict',
      maxAge: SESSION_MAX_AGE_MS,
    })

}

export default generateToken;
