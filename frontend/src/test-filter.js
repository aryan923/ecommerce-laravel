const http = require('http');

function testUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('=== URL:', url);
        try {
          const json = JSON.parse(data);
          console.log('COUNT:', json.data ? json.data.length : 0);
          if (json.data && json.data.length > 0) {
            console.log('PRODUCTS:', json.data.map(p => p.name).join(', '));
          }
        } catch (e) {
          console.log('BODY:', data.slice(0, 200));
        }
        resolve();
      });
    });
  });
}

async function main() {
  await testUrl('http://localhost:8002/api/v1/products?brand=luxora');
  await testUrl('http://localhost:8002/api/v1/products?brand=aura-paris');
  await testUrl('http://localhost:8002/api/v1/products?brand=chronos');
  await testUrl('http://localhost:8002/api/v1/products?brand=vera-leather');
  await testUrl('http://localhost:8002/api/v1/products?category=women');
}

main();
