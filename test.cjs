const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('https://rsxdgrq6-5000.inc1.devtunnels.ms/api/procurement/dispatch-instructions', {
      po_id: 2,
      site_id: 4,
      created_by: 16,
      items: [
        {
          material_id: 5,
          quantity: 10
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log("SUCCESS:", res.data);
  } catch (err) {
    console.log("ERROR STATUS:", err.response?.status);
    console.log("ERROR DATA:", JSON.stringify(err.response?.data, null, 2));
  }
}

test();
