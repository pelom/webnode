'use strict';
//import angular from 'angular';
export function JobService(JobResource, Util) {
  'ngInject';
  let safeCb = Util.safeCb;
  let jobList = [];
  let jobService = {
    getJobList() {
      return jobList;
    },
    loadJobList(query, callback) {
      return JobResource.query(query, function(data) {
        jobList = data;
        jobList.forEach((item, index, theArray) => {
          console.log(new Date(item.nextRunAt) > new Date());
          if(new Date(item.locketAt) > new Date()) {
            item.status = 'Executando';
          } else if(new Date(item.nextRunAt) > new Date()) {
            item.status = 'Aguardando';
          } else if(item.hasOwnProperty('lastFinishedAt')) {
            item.status = 'Completou';
          } else if(item.hasOwnProperty('failedAt')) {
            item.status = 'Falhou';
          }
          console.log(item);
        });
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
  };
  return jobService;
}
