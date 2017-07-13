import angular from 'angular';
import routes from './crm.routes';

import lead from './lead';
import conta from './conta';
import contato from './contato';
import produto from './produto';
import orcamento from './orcamento';
import oportunidade from './oportunidade';
import nf from './nf';
import banco from './banco';

export default angular.module('webnodeApp.crm',
['webnodeApp.auth', 'ui.router', lead, conta,
  contato, produto, orcamento, oportunidade, nf, banco])
  .config(routes).name;
