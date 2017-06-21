'use strict';

import {Router} from 'express';
import * as controller from './product.controller';
import * as auth from '../../auth/auth.service';

let router = new Router();

router.get('/domain', auth.isAuthenticated(), controller.domain);
router.get('/catalog', auth.isAuthenticated(), controller.indexCatalog);
router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);

router.put('/:id/addprice', auth.isAuthenticated(), controller.addprice);

router.delete('/:id', auth.isAuthenticated(), controller.destroy);



module.exports = router;
