'use strict';

export function routerDecorator($rootScope, $state, Auth) {
  'ngInject';
  // Redirect to login if route requires auth and the user is not logged in, or doesn't have required role
  /**
   * Se route requer autenticação e o usuário não
   * estiver conectado, ou não tiver o papel requerido
   * redirecionar para login
   */
  $rootScope.$on('$stateChangeStart', function(event, next) {
    if(!next.authenticate) {
      return;
    }

    if(typeof next.authenticate === 'string') {
      Auth.hasRole(next.authenticate)
        .then(has => {
          if(has) {
            return;
          }
          event.preventDefault();
          return Auth.isLoggedIn()
            .then(is => {
              $state.go(is ? 'home' : 'login');
            });
        });
    } else {
      Auth.isLoggedIn()
        .then(is => {
          if(is) {
            return;
          }
          event.preventDefault();
          $state.go('login');
        });
    }
  });
}
