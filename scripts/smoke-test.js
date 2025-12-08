const http = require('http');

async function testEndpoint(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000, // Assuming dev server is running
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log(`${method} ${path}: ${res.statusCode}`);
                if (res.statusCode >= 400) {
                    // resolve anyway to show error
                    console.log('Response:', data.substring(0, 200));
                }
                resolve({ status: res.statusCode, data });
            });
        });

        req.on('error', (e) => {
            console.error(`Problem with request: ${e.message}`);
            resolve({ status: 500, error: e.message });
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function run() {
    console.log('Starting Smoke Test...');
    // Note: This script assumes the server is running. 
    // Since we cannot ensure server state in this environment, this is a "soft" verification script
    // that the user can run.
    // If I could start the server, I would.

    // 1. Check Holidays
    await testEndpoint('/api/holidays');

    console.log('Done.');
}

if (require.main === module) {
    run();
}
