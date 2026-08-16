const fetch = require('node-fetch');
fetch('http://localhost:3000/api/uploads/prescriptions/test.pdf').then(res => {
    console.log(res.status);
});
