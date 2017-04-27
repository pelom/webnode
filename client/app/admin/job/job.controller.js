'use strict';

export default class JobController {
  errors = {};
  /*@ngInject*/
  constructor($scope, $timeout, JobService, usSpinnerService) {
    this.JobService = JobService;
    this.usSpinnerService = usSpinnerService;
    JobService.loadJobList()
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      usSpinnerService.stop('spinner-1');
    });
  }
  jobList() {
    return this.JobService.getJobList();
  }
}
