const http = require('http');

function getProducts() {
  return new Promise((resolve) => {
    http.get('http://localhost:8002/api/v1/products', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('PRODUCTS API RESPONSE:');
          console.log('Items Count:', json.data ? json.data.length : 0);
          console.log('Meta:', json.meta);
        } catch (e) {
          console.log('ERROR:', e.message);
        }
        resolve();
      });
    });
  });
}

getProducts();
