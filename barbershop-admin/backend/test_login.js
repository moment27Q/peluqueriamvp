// using global fetch for node 18+

async function testLogin() {
    console.log('Testing login...');
    try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'matias@gmail.com',
                password: 'matias123'
            })
        });

        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Body:', text);

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = JSON.parse(text);
        const token = data.data.tokens.accessToken;
        console.log('Token received:', token.substring(0, 20) + '...');

        console.log('Testing /employees with token...');
        const empResponse = await fetch('http://localhost:3001/api/employees', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const empText = await empResponse.text();
        console.log('Employees Status:', empResponse.status);
        console.log('Employees Body:', empText.substring(0, 200));

    } catch (error) {
        console.error('Error:', error);
    }
}

testLogin();
