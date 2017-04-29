'use strict';

export default class JobController {
  errors = {};
  /*@ngInject*/
  constructor($scope, $interval, JobService, usSpinnerService) {
    this.JobService = JobService;
    this.usSpinnerService = usSpinnerService;
    this.showhidden = false;
    JobService.loadJobList()
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      usSpinnerService.stop('spinner-1');
    });
    $interval(() => {
      this.showhidden = true;
      this.JobService.loadJobList()
      .catch(err => {
        console.log('Ex:', err);
      })
      .finally(() => {
        this.showhidden = false;
        //this.usSpinnerService.stop('spinner-1');
      });
    }, 5000);
  }
  jobList() {
    return this.JobService.getJobList();
  }
}
