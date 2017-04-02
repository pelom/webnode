'use strict';
export function UsuarioService(Util, UsuarioResource) {
  'ngInject';
  let safeCb = Util.safeCb;
  let usuarioService = {
    /**
     * Create a new user
     *
     * @param  {Object}   user     - user info
     * @param  {Function} callback - function(error, user)
     * @return {Promise}
     */
    register(user, callback) {
      //console.log('createUser :', user, callback);
      return UsuarioResource.register(user, function(/*data*/) {
        return safeCb(callback)(null, user);
      }, function(err) {
        return safeCb(callback)(err);
      }).$promise;
    },
    saveUser(user, callback) {
      return UsuarioResource.save(user, function(/*data*/) {
        return safeCb(callback)(null, user);
      }, function(err) {
        return safeCb(callback)(err);
      }).$promise;
    },
    loadUserList(callback) {
      console.log('UsuarioService.loadUserList');
      return UsuarioResource.query(function(data) {
        console.log('UsuarioService.query', data);
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadUser(user, callback) {
      console.log('UsuarioService.loadUser');
      return UsuarioResource.get(user, function(data) {
        console.log('UsuarioService.get', data);
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    }
  };
  return usuarioService;
}
