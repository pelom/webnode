'use strict';

export default class PermissaoController {
  errors = {};
  /*@ngInject*/
  constructor($scope, $timeout, AplicacaoService, PermissaoService, Modal) {
    this.PermissaoService = PermissaoService;
    this.AplicacaoService = AplicacaoService;

    //campos de controle da ordenacao das colunas da tabela
    this.sortType = 'nome';
    this.sortReverse = false;
    this.filtrarResult = '';
    //servico de modal
    this.Modal = Modal;
    this.wait = false;
    /*$timeout(function() {
      console.log($scope.ctl.wait);
       $scope.ctl.wait = false;
     }, 2000);
    */
    PermissaoService.loadProfileList();
    this.appMap = new Map();
    AplicacaoService.loadAppList((err, appList) => {
      if(!err) {
        appList.forEach(ap => {
          let apId = ap._id;
          ap.isCollapsed = true;
          ap.modulos.forEach(md => {
            let key = apId.concat(':').concat(md._id);
            this.appMap.set(key, md);
          });
        });
      }
    });
    this.isNovo = false;
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
    this.profile = {
      nome: '',
      descricao: '',
      role: '',
      tempoSessao: 1800
    };
  }
  newProfile() {
    this.isNovo = true;
    this.profile = {
      nome: '',
      descricao: '',
      role: 'user',
      tempoSessao: 1800
    };
    this.appMap.forEach((value, key) => {
      value.select = { funcoes: []}
    });
  }
  editProfile(profile) {
    this.isNovo = true;
    this.profile = profile;
    this.appMap.forEach((value, key) => {
      value.select = { funcoes: []}
    });
    profile.permissoes.forEach(perm => {
      let apId = perm.application._id;
      let mdId = perm.modulo._id;
      let key = apId.concat(':').concat(mdId);
      let md = this.appMap.get(key);
      md.select = {funcoes: []};
      md.select.funcoes = perm.funcoes;
    });
  }
  addAllFuncoes(mod) {
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
  }
  /**
   * Obter referencia a lista de Perfis
   */
  profileList() {
    return this.PermissaoService.getProfileList();
  }
}
