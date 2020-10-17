const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/userModels');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

/**
 * Muller Storage to specify where on disk to save, and filename after saving
 */
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // This is the file object contents
//     // {
//     //   fieldname: 'photo',
//     //   originalname: 'monica.jpg',
//     //   encoding: '7bit',
//     //   mimetype: 'image/jpeg',
//     //   destination: 'public/img/users',
//     //   filename: 'b6c011d4ab7a874b46145414996231a3',
//     //   path: 'public\\img\\users\\b6c011d4ab7a874b46145414996231a3',
//     //   size: 149257
//     // }
//     // Store file like user-user.id-timestamp.ext
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

/** Save the image in memory buffer and not on disk */
const multerStorage = multer.memoryStorage();

/**
 * Muller Filter
 * To only filter out files that you want, in this case in the mime field it will say what content the file is, and in this case we want only images, so we can test for image at the beginning of the string of the mim attr
 *
 * If not we can pass an error to it to say that the file is not an image
 */
multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  // File is in buffer, so we can access it directly, then making a call to disk
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

const filterObj = (obj, ...fieldsToKeep) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (fieldsToKeep.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();

//   res.status(200).json({
//     status: 'success',
//     results: users.length,
//     data: {
//       users,
//     },
//   });
// });

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = factory.getAll(User);

// user only
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updatePassword',
        400
      )
    );
  }

  // 2) Filter out unwanted field names
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update the user document
  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// admin/ lead-tour
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined! Please use /sign-up instead',
  });
};

// admin/ lead-tour
// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined',
//   });
// };

// admin/ lead-tour
exports.getUser = factory.getOne(User);

// admin
exports.updateUser = factory.updateOne(User);

// admin
exports.deleteUser = factory.deleteOne(User);
