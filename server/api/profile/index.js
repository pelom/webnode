'use strict';

import {Router} from 'express';
import * as controller from './profile.controller';
import * as auth from '../../auth/auth.service';

let router = new Router();
router.get('/', auth.hasRole('admin'), controller.index);
module.exports = router;