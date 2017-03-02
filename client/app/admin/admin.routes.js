'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
  .state('admin', {
    url: '/admin',
    template: require('./admin.html'),
    controller: 'AdminController',
    controllerAs: 'ctl',
    authenticate: 'admin'
  })
  .state('usuario', {
    url: '/usuario',
    template: require('./usuario/usuario.html'),
    controller: 'UsuarioController',
    controllerAs: 'ctl',
    authenticate: 'admin'
  })
  .state('permissoes', {
    url: '/permissoes',
    template: require('./permissao/permissao.html'),
    controller: 'PermissaoController',
    controllerAs: 'ctl',
    authenticate: 'admin'
  })
  .state('aplicacoes', {
    url: '/aplicacoes',
    template: require('./aplicacao/aplicacao.html'),
    controller: 'AplicacaoController',
    controllerAs: 'ctl',
    authenticate: 'admin'
  });
}
