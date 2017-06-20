'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('login', {
    url: '/login?referrer',
    referrer: 'home',
    template: require('./login/login.html'),
    controller: 'LoginController',
    controllerAs: 'vm'
  })
  .state('logout', {
    url: '/logout?referrer',
    referrer: 'main',
    template: '',
    controller($state, Auth) {
      'ngInject';

      var referrer = $state.params.referrer || $state.current.referrer || 'main';
      Auth.logout();
      $state.go(referrer);
    }
  })
  .state('signup', {
    url: '/signup',
    template: require('./signup/signup.html'),
    controller: 'SignupController',
    controllerAs: 'vm'
  })
  .state('signupvalid', {
    url: '/signupvalid?token',
    template: require('./signup/signupvalid.html')
  })
  .state('settings', {
    url: '/settings',
    template: require('./settings/settings.html'),
    controller: 'SettingsController',
    controllerAs: 'vm',
    authenticate: true
  })
  .state('settingspassword', {
    url: '/settings/password',
    template: require('./settings/settings.password.html'),
    authenticate: true
  })
  .state('perfil', {
    url: '/perfil',
    template: require('./perfil/perfil.html'),
    controller: 'PerfilController',
    controllerAs: 'ctl',
    authenticate: true
  })
  .state('homemenu', {
    url: '/home/menu',
    template: require('./home.menu.html'),
    controller: 'HomeMenuController',
    controllerAs: 'ctl',
    authenticate: true
  })
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
  .state('home', {
    url: '/home?defaultView&defaultDate&eventId',
    template: require('./home.html'),
    controller: 'HomeController',
    controllerAs: 'ctl',
    authenticate: true
  });
}
