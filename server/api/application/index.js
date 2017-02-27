'use strict';

import {Router} from 'express';
import * as controller from './application.controller';
import * as auth from '../../auth/auth.service';
import * as profile from '../profile/profile.service';
let router = new Router();
let permissao = function(funcao) {
  return {
    aplicacao: 'Standard',
    modulo: 'Aplicacao',
    funcao: funcao
  };
};
router.get('/', auth.hasRole('admin'),
  profile.isPermission(permissao('Ler')), controller.index);

router.post('/', auth.hasRole('admin'),
  profile.isPermission(permissao('Criar')), controller.create);

router.put('/:id', auth.hasRole('admin'),
  profile.isPermission(permissao('Modificar')), controller.update);

router.post('/:id/modulo', auth.hasRole('admin'), controller.createModulo);
router.put('/:id/modulo', auth.hasRole('admin'), controller.updateModulo);

module.exports = router;
