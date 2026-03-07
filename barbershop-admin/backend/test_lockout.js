const { AuthService } = require('./dist/services/auth.service');
const { prisma } = require('./dist/config/database');

async function run() {
    const email = 'matias@gmail.com'; // Adjust to a valid one based on user prompt
    console.log(`Testing login for ${email}...`);

    for (let i = 1; i <= 6; i++) {
        try {
            console.log(`Attempt ${i}...`);
            await AuthService.login({ email, password: 'wrongpassword' });
            console.log('Login succeeded (unexpectedly)');
        } catch (err) {
            console.log(`Failed! code: ${err.code}, min: ${err.minutesLeft}, att: ${err.attemptsLeft}`);
        }
    }

    await prisma.$disconnect();
}

run().catch(console.error);
