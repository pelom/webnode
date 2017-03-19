'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('login', {
    url: '/login',
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
    referrer: 'login',
    template: '',
    controller($state, Auth) {
      'ngInject';
      var token = $state.params.token;
      console.log(token);
      var referrer = $state.current.referrer || 'login';
      Auth.signupvalid(token)
        .then(() => {
          // Account created, redirect to home
          $state.go('main');
          //$state.go(referrer);
        })
        .catch(err => {
          console.log(err);
        });
    }
  })
  .state('settings', {
    url: '/settings',
    template: require('./settings/settings.html'),
    controller: 'SettingsController',
    controllerAs: 'vm',
    authenticate: true
  })
  .state('perfil', {
    url: '/perfil',
    template: require('./perfil/perfil.html'),
    controller: 'PerfilController',
    controllerAs: 'vm',
    authenticate: true
  });
}
