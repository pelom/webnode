'use strict';

import angular from 'angular';
import BancoController from './banco.controller';
import BancoEditController from './banco.edit.controller';
import BancoContaReceberController from './bancocontareceber.controller';
import BancoContaPagarController from './bancocontapagar.controller';

export default angular.module('webnodeApp.banco', [])
  .controller('BancoController', BancoController)
  .controller('BancoEditController', BancoEditController)
  .controller('BancoContaReceberController', BancoContaReceberController)
  .controller('BancoContaPagarController', BancoContaPagarController)
  .name;
