'use strict';

export default class PermissaoEditController {
  errors = {};
  /*@ngInject*/
  constructor($stateParams, $state, toastr, AplicacaoService, PermissaoService) {
    this.id = $stateParams.id;
    this.PermissaoService = PermissaoService;
    this.AplicacaoService = AplicacaoService;
    this.$state = $state;
    this.toastr = toastr;
    this.AplicacaoService.loadAppListFull((err, appList) => {
      if(err) {
        console.log('Ex: loadAppListFull() ', err);
        return;
      }
      this._initMapAppModulo(appList);
      if(this.id) {
        this._loadProfile();
      } else {
        this.profile = this._createProfile();
      }
    });
    this.wait = false;
    this.situacao = this.PermissaoService.getItemIsAtivoDefault();
    this.itemRole = this.PermissaoService.getItemRoleDefault();
    this.itemSessao = this.PermissaoService.getItemSessaoDefault();
  }
  _initMapAppModulo(appList) {
    this.appMap = new Map();
    appList.forEach(ap => {
      let apId = ap._id;
      ap.isCollapsed = true;
      ap.modulos.forEach(md => {
        md.select = { funcoes: [] };
        let key = apId.concat(':').concat(md._id);
        this.appMap.set(key, md);
      });
    });
  }
  _loadProfile() {
    this.PermissaoService.loadProfile({ id: this.id }, (err, profile) => {
      if(err) {
        console.log('Ex: loadProfile() ', err);
        return;
      }
      profile.permissoes.forEach(perm => {
        let apId = perm.application._id;
        let mdId = perm.modulo._id;
        let key = apId.concat(':').concat(mdId);
        if(this.appMap.has(key)) {
          let md = this.appMap.get(key);
          md.select = {funcoes: []};
          md.select.funcoes = perm.funcoes;
          md.select.id = perm._id;
        }
      });
      this.profile = profile;
    });
  }
  _createProfile() {
    return {
      nome: '',
      descricao: '',
      role: 'user',
      tempoSessao: 1800
    };
  }
  addAllFuncoes(mod) {
    mod.select.funcoes = mod.funcoes;
  }
  removeAllFuncoes(mod) {
    mod.select.funcoes = [];
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
        let perm = {
          application: appId,
          modulo: mod._id,
          funcoes: md.select.funcoes,
        };
        if(md.select.id) {
          perm._id = md.select.id;
        }
        permList.push(perm);
      });
    });
    this.profile.permissoes = permList;
    this.PermissaoService.saveProfile(this.profile)
    .then(() => {
      this.toastr.success('Perfil salvo com sucesso', `${this.profile.nome}`);
      this.$state.go('permissoes');
    })
    .catch(err => {
      console.log('Ex:', err);
      this.toastr.error(err.data.message, err.data.name, {
        autoDismiss: false,
        closeButton: true,
        timeOut: 0,
      });
    })
    .finally(() => {
      this.wait = false;
    });
  }
}
