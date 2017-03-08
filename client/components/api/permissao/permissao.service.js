'use strict';

export function PermissaoService(Util, PermissaoResource) {
  'ngInject';
  let safeCb = Util.safeCb;
  let profileList = [];
  let profile = {};
  let permissaoService = {
    getProfile() {
      return profile;
    },
    getProfileList() {
      return profileList;
    },
    loadProfile(prof, callback) {
      console.log('PermissaoService.loadProfile');
      return PermissaoResource.get(prof, function(data) {
        console.log('PermissaoResource.get', data);
        profile = data;
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadProfileList(callback) {
      console.log('PermissaoService.loadProfileList');
      return PermissaoResource.query(function(data) {
        console.log('PermissaoResource.query', data);
        profileList = data;
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    }
  };
  return permissaoService;
}
