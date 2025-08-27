import multer from 'multer';
import path from 'path';
import formatDate from '../utils/dateFormat.js';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp');
  },
  filename: function (req, file, cb) {
    cb(null, `${formatDate(new Date())}_${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /xlsx|csv/;
  const validMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ];
  const mimetype = validMimeTypes.includes(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only .xlsx and .csv files are allowed!'));
  }
};

export default multer({ storage, fileFilter });