const axios = require('axios');

async function test() {
    try {
        // Assume we need a doctor token
        // We can just login as doctor
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'admin@hakeem.jo', // we don't know the doctor credentials
            password: 'password'
        }).catch(() => null);

        console.log("We need doctor token, skipping direct test. Let me read backend logs if any.");
    } catch (e) {
        console.error(e);
    }
}
test();
