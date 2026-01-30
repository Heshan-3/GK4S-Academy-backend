import express from 'express';
import { addMaterial, deleteMaterial, getMaterials, updateMaterial } from '../Controllers/materialController.js';
import { authMiddleware } from '../Middleware/authMiddleware.js';

const materialRouter = express.Router();

materialRouter.post('/add', authMiddleware, addMaterial);
materialRouter.get('/all', authMiddleware, getMaterials);
materialRouter.delete('/delete/:id', authMiddleware, deleteMaterial);
materialRouter.put('/update/:id', authMiddleware, updateMaterial);

export default materialRouter;