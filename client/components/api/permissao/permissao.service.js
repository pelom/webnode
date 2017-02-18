'use strict';

export function PermissaoService(Util, PermissaoResource) {
  'ngInject';
  let safeCb = Util.safeCb;
  let profileList = [];
  let profile = {
    nome: '',
    descricao: ''
  };
  let permissaoService = {
    getProfile() {
      return profile;
    },
    getProfileList() {
      return profileList;
    },
    selectApp(appIndex) {
      if(appIndex > -1) {
        profile = profileList[appIndex];
      } else {
        profile = {
          nome: '',
          descricao: ''
        };
      }
      return profile;
    },
    setApp(index) {
      if(index > -1) {
        profile = profileList[index];
      } else {
        profile = {
          nome: '',
          descricao: '',
          modulos: []
        };
      }
    },

    loadProfileList(callback) {
      return PermissaoResource.query(function(data) {
        console.log('PermissaoService.loadProfileList', data);
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
