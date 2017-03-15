'use strict';

import {Router} from 'express';
import * as controller from './application.controller';
import * as auth from '../../auth/auth.service';
import * as profile from '../profile/profile.service';
let router = new Router();
let permissao = function(funcao) {
  return {
    aplicacao: 'Standard',
    modulo: 'Aplicação',
    funcao: funcao,
    role: 'admin'
  };
};
router.get('/', profile.isPermission(permissao('Ler')), controller.index);
router.get('/showlist', profile.isPermission(permissao('Ler')), controller.showList);

router.get('/:id', profile.isPermission(permissao('Ler')), controller.show);

router.post('/', profile.isPermission(permissao('Criar')), controller.create);

router.put('/:id', profile.isPermission(permissao('Modificar')), controller.update);

router.post('/:id/modulo', auth.hasRole('admin'), controller.createModulo);
router.put('/:id/modulo', auth.hasRole('admin'), controller.updateModulo);

module.exports = router;
