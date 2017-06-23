export function OrcamentoResource($resource) {
  'ngInject';
  return $resource('/api/budget/:id/:controller', {
    id: '@_id'
  }, {
    update: { method: 'PUT' },
    domain: {
      method: 'GET',
      params: {
        id: 'domain'
      }
    }
  });
}
