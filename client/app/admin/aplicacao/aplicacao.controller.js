'use strict';

export default class AplicacaoController {
  errors = {};
  /*@ngInject*/
  constructor($scope, $timeout, AplicacaoService, Modal) {
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
    AplicacaoService.loadAppList();
  }
  /**
   * Obter referencia a lista de Aplicativos
   */
  appList() {
    return this.AplicacaoService.getAppList();
  }

  openAppModal(index) {
    let app = this.AplicacaoService.selectApp(index);
    let stgTitulo = (app.nome != '') ? app.nome : 'Novo Aplicativo';

    var modal = {
      controller: 'AplicacaoEditController',
      controllerAs: 'ctl',
      dismissable: true,
      title: stgTitulo,
      html: require('./aplicacao.edit.html'),
      //buttons: [button]
    };
    var neww = this.Modal.show.open(function() {
      console.log('New');
    });
    neww(modal);
  }
}
