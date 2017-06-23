'use strict';

export default class OrcamentoItemModalController {
  /*@ngInject*/
  constructor($state, $scope, toastr, usSpinnerService, Auth, OrcamentoService) {
    this.Auth = Auth;
    this.toastr = toastr;
    this.$state = $state;
    this.usSpinnerService = usSpinnerService;
    this.OrcamentoService = OrcamentoService;
    this.init($scope);
  }

  init($scope) {
    this.orcamentoItem = this.OrcamentoService.getModalCtl().params;
    $scope.$watch('ctl.orcamentoItem.valor', () => {
      this.updateValues();
    });
    $scope.$watch('ctl.orcamentoItem.desconto', () => {
      this.updateValues();
    });
    $scope.$watch('ctl.orcamentoItem.quantidade', () => {
      this.updateValues();
    });
  }

  updateValues() {
    let valor = this.orcamentoItem.valor * this.orcamentoItem.quantidade;
    let valorDesconto = valor * this.orcamentoItem.desconto;
    let valorTotal = valor - valorDesconto;
    this.orcamentoItem.valorTotal = valorTotal;
  }

  close() {
    this.OrcamentoService.getModalCtl().onClose();
  }
}
