import multer from 'multer';

const fileValidator = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(500).send(err.message);
  } else if (err) {
    res.status(400).send(err.message);
  }
};

export default fileValidator;