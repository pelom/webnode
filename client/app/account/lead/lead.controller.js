'use strict';

export default class LeadController {
  /*@ngInject*/
  constructor(LeadService, usSpinnerService) {
    LeadService.loadLeadList()
    .then(leads => {
      this.leads = leads;
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      usSpinnerService.stop('spinner-1');
    });
  }
}
