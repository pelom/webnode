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
    PermissaoService.loadProfileList();

    this.profileMaster = '';
    this.profileNome = '';
  }
  changeProfileMaster(profile) {
    console.log('changeProfileMaster', profile);
  }

  /**
   * Obter referencia a lista de Aplicativos
   */
  appList() {
    return this.PermissaoService.getProfileList();
  }
}
