'use strict';
import angular from 'angular';
export default class AplicacaoEditController {
  /*@ngInject*/
  constructor($scope, $stateParams, $state, AplicacaoService, Modal) {
    this.id = $stateParams.id;
    this.AplicacaoService = AplicacaoService;
    this.$state = $state;
    this.Modal = Modal;
    this.modulo = {};
    if(this.id) {
      this._loadApp();
    } else {
      this.app = this._createApp();
    }
    this.itemArray = this.AplicacaoService.getItemFuncaoDefault();
    this.situacao = this.AplicacaoService.getItemIsAtivoDefault();
  }
  _loadApp() {
    this.AplicacaoService.loadApp({ id: this.id },
      (err, app) => {
        if(err) {
          return;
        }
        this.app = app;
        this.app.modulos.forEach(m => {
          m.select = [];
          m.funcoes.forEach(f => {
            m.select.push({ name: f });
          });
        });
      });
  }
  _createApp() {
    return {
      nome: '',
      descricao: '',
      modulos: [],
      isAtivo: true
    };
  }
  _createModulo() {
    return {
      nome: '',
      descricao: '',
      funcoes: [],
      select: [],
      isAtivo: true,
      isNew: true
    };
  }
  _createModalEditModulo(modalTitle) {
    return {
      controller: 'AplicacaoModuloEditController',
      controllerAs: 'ctl',
      dismissable: true,
      title: modalTitle,
      html: require('./aplicacao.modulo.edit.html'),
      //buttons: [button]
    };
  }
  editModulo(modulo) {
    let modalTitle = 'Modulo de aplicação';
    let modal = this._createModalEditModulo(modalTitle);
    let showOpen = this.Modal.show.open();
    let modalCtl = showOpen(modal);

    //o modulo nao foi definido?
    if(angular.isUndefined(modulo)) {
      modulo = this._createModulo();
      modalCtl.onModulo = modEdit => {
        modEdit.isNew = false;
        this.app.modulos.push(modEdit);
      };
    }
    //configurar o modulo a ser editado
    this.AplicacaoService.setModuloEdit(modulo);
    this.AplicacaoService.setModalCtl(modalCtl);
  }
  tagTransform(newTag) {
    var item = { id: 0, name: newTag, class: 'fa fa-tag' };
    return item;
  }
  /**
   * Salvar Aplicativo
   */
  saveApp(form) {
    if(form.$invalid) {
      return;
    }
    let isNew = this.app._id;
    return this.AplicacaoService.saveApp(this.app)
    .then(newApp => {
      this.app = newApp;
      if(isNew) {
        this.$state.go('aplicacoes');
      }
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      this.wait = false;
    });
  }
}
