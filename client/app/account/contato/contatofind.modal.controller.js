'use strict';

export default class ContatoFindModalController {
  /*@ngInject*/
  constructor($state, $scope, toastr, usSpinnerService, Auth, ContatoService) {
    this.Auth = Auth;
    this.toastr = toastr;
    this.$state = $state;
    this.usSpinnerService = usSpinnerService;
    this.ContatoService = ContatoService;
    this.ContatoService.loadContatoList(ContatoService.getModalCtl().params)
      .then(contatos => {
        this.contatos = contatos;
        this.contatoAll = contatos;
      })
      .finally(() => {
        this.usSpinnerService.stop('spinner-1');
      });
    this.int($scope);
  }

  int($scope) {
    this.contatos = [];
    this.contatoAll = [];
    this.select = -1;
    this.search = this.ContatoService.getModalCtl().params;

    let isToken = () => this.search && this.search.length > 2;
    let findAcc = () => {
      this.ContatoService.loadContatoList({
        search: this.search
      })
      .then(contatos => {
        this.contatos = contatos;
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
        this.contatos = this.contatoAll;
      }
    });
  }

  selectAcc() {
    if(this.select == -1) {
      return;
    }

    let acc = this.contatos[this.select];
    this.toastr.success('Contato selecionada', `${acc.nome}`);
    this.ContatoService.getModalCtl().onSelectAcc(acc);
  }

  close() {
    this.ContatoService.getModalCtl().onClose();
  }
}
