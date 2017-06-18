'use strict';

export default class ContaFindModalController {
  /*@ngInject*/
  constructor($state, $scope, toastr, usSpinnerService, Auth, ContaService) {
    this.Auth = Auth;
    this.toastr = toastr;
    this.$state = $state;
    this.usSpinnerService = usSpinnerService;
    this.ContaService = ContaService;
    this.ContaService.loadContaList(ContaService.getModalCtl().params)
      .then(contas => {
        this.contas = contas;
        this.contaAll = contas;
      })
      .finally(() => {
        this.usSpinnerService.stop('spinner-1');
      });
    this.int($scope);
  }

  int($scope) {
    this.contas = [];
    this.contaAll = [];
    this.select = -1;
    this.search = this.ContaService.getModalCtl().params;

    let isToken = () => this.search.length > 2;
    let findAcc = () => {
      this.ContaService.loadContaList({
        search: this.search
      })
      .then(contas => {
        this.contas = contas;
      })
      .finally(() => {
        this.usSpinnerService.stop('spinner-1');
      });
    };

    $scope.$watch('ctl.search', () => {
      this.select = -1;

      if(isToken()) {
        findAcc();
      } else {
        this.contas = this.contaAll;
      }
    });
  }

  selectAcc() {
    if(this.select == -1) {
      return;
    }

    let acc = this.contas[this.select];
    this.toastr.success('Conta selecionada', `${acc.nome}`);
    this.ContaService.getModalCtl().onSelectAcc(acc);
  }

  close() {
    this.ContaService.getModalCtl().onClose();
  }
}
