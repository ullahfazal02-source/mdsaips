import express from 'express';
import {
  createOffer,
  getMyOffers,
  getServiceOffers,
  updateOffer,
  deleteOffer,
} from '../controllers/offer.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/service/:serviceId', getServiceOffers);

router.use(protect);

router.post('/', authorize('vendor'), createOffer);
router.get('/my-offers', authorize('vendor'), getMyOffers);
router.put('/:offerId', authorize('vendor'), updateOffer);
router.delete('/:offerId', authorize('vendor'), deleteOffer);

export default router;
