'use strict';

import {Router} from 'express';
import * as controller from './application.controller';
import * as auth from '../../auth/auth.service';

let router = new Router();
router.get('/', controller.index);
router.post('/', auth.hasRole('admin'), controller.create);
router.put('/:id/modulo', auth.hasRole('admin'), controller.updateModulo);
module.exports = router;
