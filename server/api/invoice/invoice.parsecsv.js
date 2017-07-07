var csv = require('fast-csv');
export function parseCsv(invoiceCsv, callback) {
  let elements = [];
  csv.fromString(`${invoiceCsv}`, { delimiter: ';' }, { encoding: 'latin1' })
    .on('data', function(data) {
      elements.push(data);
    })
    .on('end', () => {
      console.log('done');

      let invoices = [];
      for(var i = 1; i < elements.length - 1; i++) {
        let fields = elements[i];

        let data = fields[2].split(' ');
        let dia = Number(data[0].substring(0, 2));
        let mes = Number(data[0].substring(3, 5));
        let ano = Number(data[0].substring(6, 10));
        let h = Number(data[1].substring(0, 2));
        let m = Number(data[1].substring(3, 5));
        let s = Number(data[1].substring(6, 8));

        let valorTotal = fields[26].replace(/[.]/g, '').replace(/[,]/g, '.');
        let invoice = {
          tipoNota: 'NFSe',
          numero: fields[1],
          chave: fields[3],
          dataEmissao: new Date(ano, mes, dia, h, m, s),
          valorTotal: Number(valorTotal),
          codigoServico: fields[28],
          descricao: fields[47],
          emitente: {
            cnpj: fields[10].replace(/[^\d]+/g, ''),
            nome: fields[11],
            endereco: {
              address: `${fields[12]} ${fields[13]}`,
              number: fields[14],
              complement: fields[15],
              suburb: fields[16],
              city: fields[17],
              state: fields[18],
              zipcode: fields[19].replace(/[-]+/g, ''),
            }
          },
          destinatario: {
            cnpj: fields[34].replace(/[^\d]+/g, ''),
            nome: fields[37],
            endereco: {
              address: `${fields[38]} ${fields[39]}`,
              number: fields[40],
              complement: fields[41],
              suburb: fields[42],
              city: fields[43],
              state: fields[44],
              zipcode: fields[45].replace(/[-]+/g, ''),
            }
          }
        };
        invoices.push(invoice);
      }
      return callback(invoices);
    });
}
