'use strict';

import {Router} from 'express';
import * as controller from './application.controller';

let router = new Router();
router.get('/', controller.index);
module.exports = router;
