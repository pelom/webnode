'use strict';
import angular from 'angular';
import Controller from '../controller';
import moment from 'moment';
moment.locale('pt-br');
export default class LeadController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, toastr, LeadService, usSpinnerService) {
    super($window, $scope, toastr, usSpinnerService);

    this.LeadService = LeadService;
    this.LeadService.loadLeadList()
    .then(leads => {
      this.leads = leads;
      this.formatMoment();
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      usSpinnerService.stop('spinner-1');
    });
    this.status = '';
    this.viewDetails = false;
  }

  findLeadListStatus(status) {
    this.status = status;
    this.usSpinnerService.spin('spinner-1');
    this.LeadService.loadLeadList({
      status,
    })
    .then(leads => {
      //this.toastr.success('', `Leads ${status} (${leads.length})`);
      this.leads = leads;
      this.formatMoment();
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
    });
  }

  formatMoment() {
    this.leads.forEach(item => {
      item.createdAt = moment(item.createdAt).fromNow();
    });
  }

  isActive(status) {
    return status === this.status;
  }
}
