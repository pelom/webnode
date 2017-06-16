/*eslint no-useless-constructor: 0*/
'use strict';
import angular from 'angular';
import moment from 'moment';
moment.locale('pt-br');

export default class Controller {
  constructor($window, $scope, toastr, usSpinnerService) {
    this.usSpinnerService = usSpinnerService;
    this.toastr = toastr;
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

  isJustified() {
    if(this.isFull()) {
      return 'nav-justified';
    }
    return '';
  }

  isFull() {
    return this.width >= 800;
  }

  callbackError(form) {
    return err => {
      console.log('Ex:', err);

      this.toastr.error(err.data.message, err.data.name, {
        autoDismiss: false,
        closeButton: true,
        timeOut: 0,
      });
      err = err.data;
      this.errors = {};

      angular.forEach(err.errors, (error, field) => {
        if(form.hasOwnProperty(field)) {
          form[field].$setValidity('mongoose', false);
        } else {
          this.toastr.error(error.message, field, {
            closeButton: true,
          });
        }
        this.errors[field] = error.message;
      });
    };
  }
}
