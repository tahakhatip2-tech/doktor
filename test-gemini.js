const apiKey = 'AIzaSyCPDOcPBNbgLbjcMqzB3qdcFHzcjqcBHgo';
const models = [
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemma-3-12b-it',
    'gemini-flash-latest'
];

async function test() {
  for (const model of models) {
    console.log('Testing model:', model);
    try {
      const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
        })
      });
      const data = await response.json();
      if (data.error) {
         console.error('Error for', model, data.error.message);
      } else {
         console.log('Success for', model);
      }
    } catch (e) {
      console.error('Fetch failed:', e.message);
    }
  }
}
test();
