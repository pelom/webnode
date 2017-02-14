'use strict';

export default class PermissaoController {
  errors = {};
  /*@ngInject*/
  constructor($scope, $timeout, PermissaoService, Modal) {
    this.PermissaoService = PermissaoService;
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
    PermissaoService.loadAppList();
  }
  /**
   * Obter referencia a lista de Aplicativos
   */
  appList() {
    return this.PermissaoService.getAppList();
  }

  openAppModal(index) {
    let app = this.PermissaoService.selectApp(index);
    let stgTitulo = (app.nome != '') ? app.nome : 'Novo Aplicativo';

    var modal = {
      controller: 'PermissaoAppController',
      controllerAs: 'ctl',
      dismissable: true,
      title: stgTitulo,
      html: require('./permissao.app.html'),
      //buttons: [button]
    };
    var neww = this.Modal.show.open(function() {
      console.log('New');
    });
    neww(modal);
  }
}
