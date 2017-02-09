'use strict';

class Application {
  constructor() {
    this.name = '';
    this.roles = [];
  }
}

export function PermissaoService(Util, PermissaoResource) {
  'ngInject';
  let safeCb = Util.safeCb;
  let permissaoService = {

    /**
     *
     */
    createApp(app, callback) {
      //console.log('PermissaoService.createApp :', app, callback);
      return PermissaoResource.save(app, function(data) {
        console.log('PermissaoService.createApp.save', data);
        //$cookies.put('token', data.token);
        //currentUser = User.get();
        return safeCb(callback)(null, app);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    }
  };

  return permissaoService;
}
