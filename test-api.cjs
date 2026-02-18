const http = require('http');
const fs = require('fs');

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/services/types/all?includeInactive=true',
    method: 'GET',
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        fs.writeFileSync('api-response.json', data);
        console.log('Response written to api-response.json');
    });
});

req.on('error', (error) => {
    fs.writeFileSync('api-error.txt', error.message);
    console.error('Error:', error);
});

req.end();
