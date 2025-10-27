import express from "express";
// const firstStockSet = require("../controller/firstStockSet.cjs");
// import * as firstStockSet from "../controller/firstStockSet.js";
import { set_loginAll } from "../controller/firstStockSet.js";
const router = express.Router();


//Admin Firstock sets
router.post('/setloginAll',set_loginAll)

export default router;