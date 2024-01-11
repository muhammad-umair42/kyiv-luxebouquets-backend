import { Router } from 'express';
import { createOrder, getOrder } from '../controllers/order.controller.js';
import { isRequestAuthorized } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/order/create').post(isRequestAuthorized, createOrder);
router.route('/getorders').get(isRequestAuthorized, getOrder);
export default router;
