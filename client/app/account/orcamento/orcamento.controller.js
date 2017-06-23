'use strict';
import angular from 'angular';
import Controller from '../controller';
import moment from 'moment';
moment.locale('pt-br');
export default class OrcamentoController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, toastr, OrcamentoService, usSpinnerService) {
    super($window, $scope, toastr, usSpinnerService);

    this.OrcamentoService = OrcamentoService;
    this.OrcamentoService.loadOrcamentoList()
    .then(orcamentos => {
      this.orcamentos = orcamentos;
      this.init();
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      usSpinnerService.stop('spinner-1');
    });
  }

  init() {
    this.status = '';
  }

  findOrcamentoListStatus(status) {
    this.status = status;
    this.usSpinnerService.spin('spinner-1');
    this.OrcamentoService.loadOrcamentoList({
      status,
    })
    .then(orcamentos => {
      //this.toastr.success('', `Leads ${status} (${leads.length})`);
      this.orcamentos = orcamentos;
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
    });
  }

  isActive(status) {
    return status === this.status;
  }

  getIcon(orcamento) {
    if(orcamento.status === 'Rascunho') {
      return 'fa-pencil-square-o';
    } else if(orcamento.status === 'Aprovado') {
      return 'fa-thumbs-o-up';
    } else if(orcamento.status === 'Rejeitado') {
      return 'fa-thumbs-o-down';
    }
    return '';
  }
}
