'use strict';

import {Router} from 'express';
import * as controller from './lead.controller';
import * as auth from '../../auth/auth.service';
import {register} from './lead.trigger';
register();

let router = new Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/domain', auth.isAuthenticated(), controller.domain);
router.post('/', auth.isAuthenticated(), controller.create);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.put('/:id', auth.isAuthenticated(), controller.update);

module.exports = router;
