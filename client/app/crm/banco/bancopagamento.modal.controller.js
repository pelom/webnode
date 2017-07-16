'use strict';
import moment from 'moment';

export default class BancoPagamentoModalController {
  /*@ngInject*/
  constructor($state, $scope, toastr, usSpinnerService, BancoService) {
    this.toastr = toastr;
    this.$state = $state;
    this.BancoService = BancoService;
    this.usSpinnerService = usSpinnerService;
    this.init($scope);
  }

  init($scope) {
    this.format = 'dd/MM/yyyy HH:mm';
    this.pag = this.BancoService.getModalCtl().params.pagamento;
    console.log(this.pag);
    this.pag.dataEmissao = new Date(this.pag.dataEmissao);
    this.pag.pagamento.dataVencimento = new Date(this.pag.pagamento.dataVencimento);

    this.BancoService.loadBancoList({ accountBank: this.pag.accountBank })
      .then(bancos => {
        this.bancos = bancos;
      });
  }

  setPagamento(form) {
    if(form.$invalid) {
      return;
    }
    console.log(this.pag);

    this.usSpinnerService.spin('spinner-1');
    this.BancoService.operation({
      _id: this.pag.banco,
      titulo: this.pag.titulo,
      valor: this.pag.tipo === 'receivable' ? this.pag.pagamento.valor : -this.pag.pagamento.valor,
      dataPagamento: this.pag.dataPagamento,
      pagamentoId: this.pag.pagamento._id,
      conta: this.pag.referente._id,
      nfId: this.pag.nfId,
    })
      .then(() => {
        //this.toastr.success('Operação financeira salva com sucesso',
        //`${this.pag.titulo}`);
        this.BancoService.getModalCtl().setPagamento();
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        this.usSpinnerService.stop('spinner-1');
      });
  }
  close() {
    this.BancoService.getModalCtl().onClose();
  }
}
