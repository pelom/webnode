'use strict';

import {Router} from 'express';
import * as controller from './lead.controller';
import * as auth from '../../auth/auth.service';
let router = new Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/domain', auth.isAuthenticated(), controller.domain);

module.exports = router;
