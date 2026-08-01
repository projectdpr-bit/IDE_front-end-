const axios = require('axios');

async function testAxios() {
  const payload = {
    "po_id": 15,
    "site_id": 4,
    "created_by": 16,
    "items": [
      {
        "material_id": 5,
        "quantity": 8
      }
    ]
  };

  try {
    console.log("Sending POST to https://rsxdgrq6-5000.inc1.devtunnels.ms/api/procurement/dispatch-instructions...");
    const res = await axios.post('https://rsxdgrq6-5000.inc1.devtunnels.ms/api/procurement/dispatch-instructions', payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Tunnel-Skip-AntiPhishing-Page': 'true'
      }
    });
    console.log("✅ SUCCESS!");
    console.log("Status:", res.status);
    console.log("Response Data:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log("❌ ERROR!");
    console.log("Status:", err.response?.status);
    console.log("Error Data:", JSON.stringify(err.response?.data, null, 2));
  }
}

testAxios();
