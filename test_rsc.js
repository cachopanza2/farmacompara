const axios = require('axios');
const fs = require('fs');

async function test() {
  const url = 'https://www.puntofarma.com.py/buscar?s=ibuprofeno';
  const resp = await axios.get(url, {
    headers: { 
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/x-component',
      'RSC': '1',
      'Next-Router-State-Tree': '%5B%22%22%2C%7B%22children%22%3A%5B%22(guest)%22%2C%7B%22children%22%3A%5B%22buscar%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%5D%7D%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
      'Next-Url': '/buscar',
    },
    timeout: 30000
  });
  
  const text = resp.data.toString();
  const prices = text.match(/Gs\.\s*[\d.,]+/g) || [];
  const productNames = text.match(/"[^"]{10,80}[Ii]buprofeno[^"]{0,50}"/g) || [];
  console.log('Precios encontrados:', prices.slice(0, 10));
  console.log('Productos encontrados:', productNames.slice(0, 5));
  console.log('Longitud total del payload:', text.length);
  
  // Guardar el payload para análisis
  fs.writeFileSync('/home/ubuntu/rsc_payload.txt', text.substring(0, 50000));
  console.log('Payload guardado en /home/ubuntu/rsc_payload.txt');
}

test().catch(e => console.error('Error:', e.response?.status, e.message));
