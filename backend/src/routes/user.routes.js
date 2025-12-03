import { Router } from "express";
import userController from "../controllers/user.controller.js";

const { login, register, addToHistory, getUserHistory } = userController;

const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/add_to_activity").post(addToHistory);
router.route("/get_all_activity").get(getUserHistory);

export default router;
