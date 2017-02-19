'use strict';

export function AplicacaoService(Util, AplicacaoResource) {
  'ngInject';
  let safeCb = Util.safeCb;
  let appList = [];
  let app = {
    nome: '',
    descricao: '',
    modulos: []
  };
  let aplicacaoService = {
    getApp() {
      return app;
    },
    getAppList() {
      return appList;
    },
    selectApp(appIndex) {
      if(appIndex > -1) {
        app = appList[appIndex];
        app.index = appIndex;
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
      this.selectApp(index)
    },

    loadAppList(callback) {
      return AplicacaoResource.query(function(data) {
        console.log('AplicacaoService.loadAppList', data);
        appList = data;
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },

    /**
     * Salvar Aplicativo
     */
    saveAplicavo(newApp, callback) {
      let oldApp = JSON.parse(JSON.stringify(newApp));
      if(oldApp._id === null) {
        return AplicacaoResource.save(oldApp, function(data) {
          console.log('AplicacaoResource.saveAplicavo.save');
          console.log('newApp', oldApp);
          console.log('createApp', data);
          appList.splice(0, 0, data);//adicionar no Aplicativo no inicio da lista
          app = data;//atualizar das do Aplicativo referencia
          return safeCb(callback)(data);
        }, function(err) {
          console.log('Ex:', err);
          return safeCb(callback)(err);
        }).$promise;
      }
      return AplicacaoResource.update(app, function(data) {
        console.log('AplicacaoResource.saveAplicavo.update', app, data);
        appList[app.index] = data;
        app = data;
        return safeCb(callback)(data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    saveModulo(modulo, callback) {
      if(modulo._id === null) {
        modulo._id = app._id;
        return AplicacaoResource.createModulo(modulo, function(data) {
          console.log('AplicacaoResource.createModulo.modulo', modulo, data);
          app.modulos.push(data);
          //appList[app.index] = data;
          //app = data;
          return safeCb(callback)(data);
        }, function(err) {
          console.log('Ex:', err);
          return safeCb(callback)(err);
        }).$promise;
      } else {
        return AplicacaoResource.updateModulo(modulo, function(data) {
          console.log('AplicacaoResource.updateModulo.modulo', modulo, data);
          let index = app.modulos.indexOf(modulo);
          app.modulos.splice(index, 1, data);
          //appList[app.index] = data;
          //app = data;
          return safeCb(callback)(data);
        }, function(err) {
          console.log('Ex:', err);
          return safeCb(callback)(err);
        }).$promise;
      }
    }
  };
  return aplicacaoService;
}
