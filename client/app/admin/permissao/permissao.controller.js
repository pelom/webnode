'use strict';

export default class PermissaoController {
  errors = {};
  /*@ngInject*/
  constructor($scope, $timeout, PermissaoService) {
    this.PermissaoService = PermissaoService;
    PermissaoService.loadProfileList();
  }
  /**
   * Obter referencia a lista de Perfis
   */
  profileList() {
    return this.PermissaoService.getProfileList();
  }
}
