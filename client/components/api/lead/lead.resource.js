export function LeadResource($resource) {
  'ngInject';
  return $resource('/api/lead/:id/:controller', {
    id: '@_id'
  }, {
    update: { method: 'PUT' },
    domain: {
      method: 'GET',
      params: {
        id: 'domain'
      }
    },
    addActivity: {
      method: 'PUT',
      params: {
        controller: 'addactivity'
      }
    },
    removeActivity: {
      method: 'PUT',
      params: {
        controller: 'removeactivity'
      }
    },
  });
}
