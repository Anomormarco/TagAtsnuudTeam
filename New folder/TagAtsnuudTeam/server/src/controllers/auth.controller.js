const authService = require("../services/auth.service");
const userRepository = require("../repositories/user.repository");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const { sendSuccess } = require("../utils/response");
const passwordUtil = require("../utils/password");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const formatUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  createdAt: user.createdAt,
});

const validateRegisterBody = ({ name, email, password, confirmPassword }) => {
  if (!name || !email || !password || !confirmPassword) {
    throw new ApiError(400, "Name, email, password, and confirmPassword are required");
  }

  if (!authService.validateEmail(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  authService.validatePassword(password);
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  validateRegisterBody(req.body);

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new ApiError(409, "Email already registered");
  }

  const hashedPassword = await passwordUtil.hash(password);
  const user = await userRepository.create({
    name,
    email,
    password: hashedPassword,
    role: "user",
  });
  const tokens = authService.generateTokenPair(user.id);

  await userRepository.updateRefreshToken(user.id, tokens.refreshToken);
  res.cookie("refreshToken", tokens.refreshToken, cookieOptions);

  sendSuccess(
    res,
    {
      user: formatUser(user),
      accessToken: tokens.accessToken,
    },
    "User registered successfully",
    201
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await userRepository.findByEmailWithPassword(email);
  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await passwordUtil.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const tokens = authService.generateTokenPair(user.id);
  await userRepository.updateRefreshToken(user.id, tokens.refreshToken);
  res.cookie("refreshToken", tokens.refreshToken, cookieOptions);

  sendSuccess(
    res,
    {
      user: formatUser(user),
      accessToken: tokens.accessToken,
    },
    "Login successful"
  );
});

const logout = asyncHandler(async (req, res) => {
  await userRepository.updateRefreshToken(req.user.userId, null);
  res.clearCookie("refreshToken");
  sendSuccess(res, null, "Logout successful");
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (!token) {
    throw new ApiError(401, "Refresh token not provided");
  }

  const decoded = authService.verifyRefreshToken(token);
  const userWithToken = await userRepository.getRefreshToken(decoded.userId);

  if (!userWithToken || userWithToken.refreshToken !== token) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const tokens = authService.generateTokenPair(decoded.userId);
  await userRepository.updateRefreshToken(decoded.userId, tokens.refreshToken);
  res.cookie("refreshToken", tokens.refreshToken, cookieOptions);

  sendSuccess(res, { accessToken: tokens.accessToken }, "Token refreshed");
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.userId);
  sendSuccess(res, formatUser(user), "Profile loaded");
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getMe,
};
