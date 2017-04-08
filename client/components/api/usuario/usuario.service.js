'use strict';
import angular from 'angular';
export function UsuarioService(Util, UsuarioResource) {
  'ngInject';
  let itemIsAtivo = [
    { name: 'Ativo', value: true },
    { name: 'Desativo', value: false }
  ];
  let safeCb = Util.safeCb;
  let usuarioService = {
    getItemIsAtivoDefault() {
      return itemIsAtivo;
    },
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
    saveUser(newUser, callback) {
      if(angular.isUndefined(newUser._id)) {
        return UsuarioResource.save(newUser, function(/*data*/) {
          return safeCb(callback)(null, newUser);
        }, function(err) {
          return safeCb(callback)(err);
        }).$promise;
      }
      Reflect.deleteProperty(newUser, 'login');
      return UsuarioResource.update(newUser, function(data) {
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
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
