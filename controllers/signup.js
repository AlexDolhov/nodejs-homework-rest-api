const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const fs = require('fs/promises');
const path = require('path');
const Jimp = require('jimp');
const { nanoid } = require('nanoid');

const { User } = require('../models/user');

const { HttpError, ctrlWrapper, sendEmail } = require('../helpers');

const { SECRET_KEY, BASE_URL } = process.env;

const signup = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, 'Email in use');
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = nanoid();

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: 'Verify your email',
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click to verify your email</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    email: newUser.email,
    subscription: newUser.subscription,
  });
};

const verify = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw HttpError(404, 'User not found');
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: null,
  });

  res.json({ message: 'Verification successful' });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, 'Email or password is invalid');
  }

  if (!user.verify) {
    throw HttpError(401, 'Please verify your reistration first');
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, 'Email or password is invalid');
  }

  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '23h' });
  await User.findByIdAndUpdate(user._id, { token });
  res.json({
    token,
    email: user.email,
    subscription: user.subscription,
  });
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;
  res.json({ email, subscription });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: '' });
  res.json({ message: 'Logout success' });
};

const updateSubscription = async (req, res) => {
  const { _id } = req.user;
  const { subscription } = req.body;
  console.log(_id);
  console.log(subscription);
  if (!_id) {
    throw HttpError(401);
  }

  // Варіант №2
  // const result = await User.findByIdAndUpdate(
  //   _id,
  //   { subscription },
  //   { new: true }
  // ).select({ email: 1, subscription: 1 });

  // res.json(result);

  await User.findByIdAndUpdate(_id, { subscription });

  res.json({
    message: `Subscription changed to ${subscription} successfully`,
  });
};

const avatarsDir = path.join(__dirname, '../', 'public', 'avatars');
const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, filename } = req.file;
  const newFileName = `${_id}${filename}`;
  const resultUpload = path.join(avatarsDir, newFileName);

  await Jimp.read(tempUpload)
    .then(avatar => {
      return avatar
        .resize(250, 250) // resize
        .write(tempUpload); // save
    })
    .catch(err => {
      throw err;
    });

  await fs.rename(tempUpload, resultUpload);

  const avatarURL = path.join('avatars', newFileName);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({
    avatarURL,
  });
};

module.exports = {
  signup: ctrlWrapper(signup),
  verify: ctrlWrapper(verify),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
};
