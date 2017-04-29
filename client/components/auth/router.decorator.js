'use strict';

export function routerDecorator($rootScope, $state, Auth) {
  'ngInject';
  // Redirect to login if route requires auth and the user is not logged in, or doesn't have required role

  let isAuth = function(next) {
    return next.authenticate;
  };
  let isRole = function(next) {
    return typeof next.authenticate === 'string';
  };
  let hasRole = function(event, next) {
    Auth.hasRole(next.authenticate)
      .then(has => {
        if(has) {
          return has;
        }
        event.preventDefault();

        Auth.isLoggedIn().then(is => {
          if(is) {
            $state.go('home');
          } else {
            $state.go('login', {
              referrer: next.name
            });
          }
        });
        return has;
      });
  };
  let hasLogin = function(event, next) {
    Auth.isLoggedIn().then(is => {
      if(is) {
        return is;
      }
      event.preventDefault();
      $state.go('login', {
        referrer: next.name
      });
      return is;
    });
  };

  $rootScope.$on('$stateChangeStart', function(event, next) {
    console.log('router: stateChangeStart: ', next);

    if(!isAuth(next)) {
      return;
    } else if(isRole(next)) {
      hasRole(event, next);
    } else {
      hasLogin(event, next);
    }
  });
}
