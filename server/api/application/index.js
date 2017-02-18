'use strict';

import {Router} from 'express';
import * as controller from './application.controller';
import * as auth from '../../auth/auth.service';
import * as application2 from './application2.service';

let router = new Router();
router.get('/', auth.hasRole('admin'), application2.isPermission('profileAdmin'), controller.index);
router.post('/', auth.hasRole('admin'), controller.create);
router.put('/:id', auth.hasRole('admin'), controller.update);
router.put('/:id/modulo', auth.hasRole('admin'), controller.updateModulo);
module.exports = router;
