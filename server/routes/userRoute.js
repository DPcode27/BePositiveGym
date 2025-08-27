// gym-app/server/routes/userRoute.js
import express from 'express';
import userController from '../controllers/userController.js';

const router = express.Router();

// router.get('/', userController.restrictToAdmin, userController.getAllUsers);
// router.get('/:id', userController.getUserById);
// router.post('/add', userController.restrictToAdmin, userController.createUser);
// router.put('/:id', userController.restrictToAdmin, userController.updateUser);
// router.delete('/:id', userController.restrictToAdmin, userController.deleteUser);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/add', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id',userController.deleteUser);

export default router;