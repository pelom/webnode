'use strict';

import {Router} from 'express';
import * as controller from './opportunity.controller';
import * as auth from '../../auth/auth.service';

let router = new Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/domain', auth.isAuthenticated(), controller.domain);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);

module.exports = router;
