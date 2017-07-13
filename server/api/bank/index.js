'use strict';

import {Router} from 'express';
import * as controller from './bank.controller';
import * as auth from '../../auth/auth.service';

let router = new Router();

router.get('/domain', auth.isAuthenticated(), controller.domain);
router.get('/accountPayable', auth.isAuthenticated(), controller.accountPayable);
router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.put('/:id/operation', auth.isAuthenticated(), controller.operation);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
