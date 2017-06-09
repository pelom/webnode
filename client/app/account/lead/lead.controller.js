'use strict';
import angular from 'angular';
export default class LeadController {
  /*@ngInject*/
  constructor($window, $scope, toastr, LeadService, usSpinnerService) {
    this.usSpinnerService = usSpinnerService;
    this.toastr = toastr;
    this.LeadService = LeadService;
    this.LeadService.loadLeadList()
    .then(leads => {
      this.leads = leads;
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      usSpinnerService.stop('spinner-1');
    });
    this.status = '';
    this.managerLayout($window, $scope);
  }

  managerLayout($window, $scope) {
    this.width = $window.innerWidth;

    let onResize = () => {
      //console.log('$window.innerWidth:', $window.innerWidth);
      this.width = $window.innerWidth;
      $scope.$digest();
    };

    angular.element($window).on('resize', onResize);

    $scope.$on('$destroy', () => {
      console.log('$destroy');
      angular.element($window).off('resize', onResize);
    });
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

  isJustified() {
    if(this.isFull()) {
      return 'nav-justified';
    }
    return '';
  }

  isFull() {
    return this.width >= 800;
  }
}
