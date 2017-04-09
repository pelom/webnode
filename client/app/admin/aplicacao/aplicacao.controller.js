'use strict';

export default class AplicacaoController {
  errors = {};
  /*@ngInject*/
  constructor($scope, $timeout, AplicacaoService) {
    this.AplicacaoService = AplicacaoService;
    this.wait = false;
    AplicacaoService.loadAppList();
  }
  appList() {
    return this.AplicacaoService.getAppList();
  }
}
