'use strict';

import {Router} from 'express';
import * as controller from './contact.controller';
import * as auth from '../../auth/auth.service';

import {register} from './contact.trigger';
register();

let router = new Router();

router.get('/domain', auth.isAuthenticated(), controller.domain);
router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
