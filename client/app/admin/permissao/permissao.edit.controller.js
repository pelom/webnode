'use strict';

export default class PermissaoEditController {
  errors = {};
  /*@ngInject*/
  constructor($stateParams, $state, $timeout, AplicacaoService, PermissaoService) {
    this.id = $stateParams.id;
    this.PermissaoService = PermissaoService;
    this.AplicacaoService = AplicacaoService;
    this.$state = $state;
    this.appMap = new Map();
    this.AplicacaoService.loadAppListFull((err, appList) => {
      if(!err) {
        appList.forEach(ap => {
          let apId = ap._id;
          ap.isCollapsed = true;
          ap.modulos.forEach(md => {
            md.select = { funcoes: [] };
            let key = apId.concat(':').concat(md._id);
            this.appMap.set(key, md);
          });
        });
        if(this.id) {
          this.PermissaoService.loadProfile({ id: $stateParams.id }, (err, profile) => {
            if(err) {
              console.log('Ex: PermissaoService.get ', err);
              return;
            }
            profile.permissoes.forEach(perm => {
              let apId = perm.application._id;
              let mdId = perm.modulo._id;
              let key = apId.concat(':').concat(mdId);
              let md = this.appMap.get(key);
              md.select = {funcoes: []};
              md.select.funcoes = perm.funcoes;
            });
            this.profile = profile;
          });
        } else {
          this.profile = {
            nome: '',
            descricao: '',
            role: 'user',
            tempoSessao: 1800
          };
        }
      }
    });
    this.wait = false;
    //$timeout(bsLoadingOverlayService.stop, 5000);
    /*$timeout(function() {
      console.log($scope.ctl.wait);
       $scope.ctl.wait = false;
     }, 2000);
    */
    this.situacao = [
      { name: 'Ativo', value: 'true' },
      { name: 'Desativo', value: 'false' }
    ];
    this.itemRole = [
      { label: 'Usuário', value: 'user'},
      { label: 'Administrador', value: 'admin'}
    ];
    this.itemSessao = [
      { label: '24 horas após o login', value: 60 * 60 * 24 },
      { label: '12 horas após o login', value: 60 * 60 * 12 },
      { label: '8 horas após o login', value: 60 * 60 * 8 },
      { label: '4 horas após o login', value: 60 * 60 * 4 },
      { label: '2 horas após o login', value: 60 * 60 * 2 },
      { label: '1 horas após o login', value: 60 * 60 },
      { label: '30 minutos após o login', value: 60 * 30 },
      { label: '15 minutos após o login', value: 60 * 15 }
    ];
  }
  addAllFuncoes(mod) {
    console.log(mod);
    mod.select.funcoes = mod.funcoes;
  }
  saveProfile(form) {
    if(form.$invalid) {
      return;
    }
    let appList = this.AplicacaoService.getAppList();
    let permList = [];
    appList.forEach(app => {
      let appId = app._id;
      app.modulos.forEach(mod => {
        let key = appId.concat(':').concat(mod._id);
        let md = this.appMap.get(key);
        permList.push({
          application: appId,
          modulo: mod._id,
          funcoes: md.select.funcoes
        });
      });
    });
    console.log(permList);
    this.$state.go('permissoes');
  }
}
