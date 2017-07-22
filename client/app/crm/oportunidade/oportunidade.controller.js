'use strict';
import angular from 'angular';
import Controller from '../../account/controller';
import moment from 'moment';
moment.locale('pt-br');

export default class OportunidadeController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, toastr, OportunidadeService, usSpinnerService) {
    super($window, $scope, toastr, usSpinnerService);

    this.OportunidadeService = OportunidadeService;
    this.OportunidadeService.loadOportunidadeList()
    .then(opps => {
      this.opps = opps;
      this.formatMoment();
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

  findOppListStatus(status) {
    this.status = status;
    this.usSpinnerService.spin('spinner-1');
    this.OportunidadeService.loadOportunidadeList({
      status,
    })
    .then(opps => {
      this.opps = opps;
      this.formatMoment();
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

  getIcon(opp) {
    if(opp.fase === 'Qualificação') {
      return 'fa-pencil-square-o';
    } else if(opp.fase === 'Negociação') {
      return 'fa-briefcase';
    } else if(opp.fase === 'Orçamento') {
      return 'fa-calculator';
    } else if(opp.fase === 'Faturamento') {
      return 'fa-arrow-circle-up';
    } else if(opp.fase === 'Perdida') {
      return 'fa-arrow-circle-down';
    }
    return '';
  }

  formatMoment() {
    this.opps.forEach(item => {
      item.createdAt = moment(item.createdAt).fromNow();
    });
  }
}
