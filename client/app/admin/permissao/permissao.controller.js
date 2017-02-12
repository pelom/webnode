'use strict';

export default class PermissaoController {
  errors = {};
  /*@ngInject*/
  constructor($scope, PermissaoService, Modal) {
    this.PermissaoService = PermissaoService;

    this.abaAtiva = 0;//index da aba ativa
    this.sortType = 'nome';
    this.sortReverse = false;
    this.filtrarResult = '';
    this.Modal = Modal;
    this.checkModel = {
      ler: true,
      criar: true,
      modificar: true,
      excluir: true
    };
    this.modulo = {
      nome: '',
      funcoes: []
    };
    $scope.$watchCollection('ctl.checkModel', function() {
      $scope.ctl.modulo.funcoes = [];
      angular.forEach($scope.ctl.checkModel, function(value, key) {
        if (value) {
          $scope.ctl.modulo.funcoes.push(key);
        }
      });
    });
  }

  app() {
    return this.PermissaoService.getApp();
  }
  /**
   * Obter lista de Aplicativos
   */
  appList() {
    return this.PermissaoService.getAppList();
  }

  openAppModal(index) {
    let app = this.PermissaoService.selectApp(index);
    let stgTitulo = (app.nome != '') ? app.nome : 'Novo Aplicativo';

    var modal = {
      controller: 'PermissaoController',
      controllerAs: 'ctl',
      dismissable: true,
      title: stgTitulo,
      html: require('./novo.html'),
      //buttons: [button]
    };
    var neww = this.Modal.show.open(function() {
      console.log('New');
    });
    neww(modal);
  }

  createModulo(form) {
    console.log(this.modulo);
    if(form.$valid && this.modulo.funcoes.length > 0) {
      console.log('Valid');

      let arr = this.checkModel;
      //this.PermissaoService.createModulo(this.modulo);
      this.app().modulos.push({
        nome: this.modulo.nome,
        funcoes: this.modulo.funcoes
      });
      this.PermissaoService.createModulo();
      this.modulo.nome = '';
      this.modulo.funcoes = [];
      angular.forEach(this.checkModel, function(value, key) {
        arr[key] = false;
      });
      form.$setPristine();
    }
  }

  createApp(form) {
    return this.PermissaoService.createApp()
    .then(ap => {
      console.log('createApp.then', ap);
      this.abaAtiva = 1;
    })
    .catch(err => {
      console.log('Ex:', err);
    });
  }
}
