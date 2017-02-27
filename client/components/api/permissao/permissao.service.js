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
    _initProfile() {
      return {
        nome: '',
        descricao: ''
      };
    },
    getProfile() {
      return profile;
    },
    getProfileList() {
      return profileList;
    },
    selectProfile(index) {
      if(index < 0 || index > profileList.length) {
        profile = this._initProfile();
      } else {
        profile = profileList[index];
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
