'use strict';

export function PermissaoService(Util, PermissaoResource) {
  'ngInject';
  let safeCb = Util.safeCb;
  let appList = [];
  let app = {
    nome: '',
    descricao: '',
    modulos: []
  };
  let permissaoService = {
    getApp() {
      return app;
    },
    getAppList() {
      return appList;
    },
    selectApp(appIndex) {
      if(appIndex > -1) {
        app = appList[appIndex];
      } else {
        app = {
          nome: '',
          descricao: '',
          modulos: []
        };
      }
      return app;
    },
    setApp(index) {
      if(index > -1) {
        app = appList[index];
      } else {
        app = {
          nome: '',
          descricao: '',
          modulos: []
        };
      }
    },

    loadAppList(callback) {
      return PermissaoResource.query(function(data) {
        console.log('PermissaoService.loadAppList', data);
        appList = data;
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },

    /**
     * Criar novo Aplicativo
     */
    createApp(newApp, callback) {
      let oldApp = JSON.parse(JSON.stringify(newApp));
      return PermissaoResource.save(oldApp, function(data) {
        console.log('PermissaoService.createApp.save');
        console.log('newApp', oldApp);
        console.log('createApp', data);
        appList[0] = data;//adicionar no Aplicativo no inicio da lista
        app = data;//atualizar das do Aplicativo referencia
        return safeCb(callback)(data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },

    createModulo(callback) {
      return PermissaoResource.modulo(app, function(data) {
        console.log('PermissaoService.createModulo.modulo', app, data);
        return safeCb(callback)(data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    }
  };
  return permissaoService;
}
