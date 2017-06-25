'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
  .state('leads', {
    url: '/leads',
    template: require('./lead/lead.html'),
    controller: 'LeadController',
    controllerAs: 'ctl',
    authenticate: true
  })
  .state('leadedit', {
    url: '/leads/edit/:id',
    template: require('./lead/lead.edit.html'),
    controller: 'LeadEditController',
    controllerAs: 'ctl',
    authenticate: true
  })
  .state('contas', {
    url: '/contas',
    template: require('./conta/conta.html'),
    controller: 'ContaController',
    controllerAs: 'ctl',
    authenticate: true
  })
  .state('contaedit', {
    url: '/contas/edit/:id',
    template: require('./conta/conta.edit.html'),
    controller: 'ContaEditController',
    controllerAs: 'ctl',
    authenticate: true
  })
  .state('contatos', {
    url: '/contatos',
    template: require('./contato/contato.html'),
    controller: 'ContatoController',
    controllerAs: 'ctl',
    authenticate: true
  })
  .state('contatoedit', {
    url: '/contatos/edit/:id',
    template: require('./contato/contato.edit.html'),
    controller: 'ContatoEditController',
    controllerAs: 'ctl',
    authenticate: true
  })
  .state('catalogo', {
    url: '/catalogo',
    template: require('./produto/produtocatalog.html'),
    controller: 'ProdutoCatalogController',
    controllerAs: 'ctl',
    authenticate: true
  })
  .state('produtos', {
    url: '/produtos',
    template: require('./produto/produto.html'),
    controller: 'ProdutoController',
    controllerAs: 'ctl',
    authenticate: true
  })
  .state('produtoedit', {
    url: '/produtos/edit/:id',
    template: require('./produto/produto.edit.html'),
    controller: 'ProdutoEditController',
    controllerAs: 'ctl',
    authenticate: true
  })
  .state('orcamentos', {
    url: '/orcamentos',
    template: require('./orcamento/orcamento.html'),
    controller: 'OrcamentoController',
    controllerAs: 'ctl',
    authenticate: true
  })
  .state('orcamentoedit', {
    url: '/orcamentos/edit/:id?oppId',
    template: require('./orcamento/orcamento.edit.html'),
    controller: 'OrcamentoEditController',
    controllerAs: 'ctl',
    authenticate: true
  })
  .state('oportunidades', {
    url: '/oportunidades',
    template: require('./oportunidade/oportunidade.html'),
    controller: 'OportunidadeController',
    controllerAs: 'ctl',
    authenticate: true
  })
  .state('oportunidadeedit', {
    url: '/oportunidades/edit/:id?accId',
    template: require('./oportunidade/oportunidade.edit.html'),
    controller: 'OportunidadeEditController',
    controllerAs: 'ctl',
    authenticate: true
  });
}
