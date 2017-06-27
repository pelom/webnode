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
    },
    pdf: {
      method: 'GET',
      params: {
        controller: 'pdf'
      },
      headers: {
        accept: 'application/pdf'
      },
      responseType: 'arraybuffer',
      cache: true,
      transformResponse(data) {
        var pdf;
        if(data) {
          pdf = new Blob([data], {
            type: 'application/pdf',
            lastModified: Date.now()
          });
        }
        return {
          response: pdf
        };
      }
    }
  });
}
