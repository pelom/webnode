'use strict';
import {Router} from 'express';
import * as controller from './invoice.controller';
import * as auth from '../../auth/auth.service';
let router = new Router();

router.get('/domain', auth.isAuthenticated(), controller.domain);
router.get('/cashFlowInputOrigin', auth.isAuthenticated(), controller.cashFlowInputOrigin);
router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.post('/upload', auth.isAuthenticated(), controller.uploadInvoice);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);


module.exports = router;
