import express from 'express';
import { loginController, productController, refreshController, registerController, userController } from '../controllers/index.js';
import auth from '../middlewares/auth.js';
import admin from '../middlewares/admin.js';


const router = express.Router();

router.post("/register", registerController.register);
router.post("/login", loginController.login);
router.post("/logout", loginController.logout);
router.get("/me", auth, userController.me);
router.post("/refresh", auth, refreshController.refresh);

// router.post("/products", [auth, admin], productController.store);
router.get("/products", productController.index);
router.get("/products/:id", productController.show);
router.post("/products", productController.store);
router.put("/products/:id", productController.update);
router.delete("/products/:id", productController.destroy);


export default router;