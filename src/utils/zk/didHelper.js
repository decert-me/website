import axios from "axios";

export async function registerDidDoc(
  didDoc,
  url = "https://card-service.zkid.app/api"
) {
  const res = await axios.post(`${url}/did`, { didDocument: didDoc });

  if (res.data.code === 200) {
    console.log(`Success: DID Document Registerd (${didDoc.controller})`);
  } else {
    console.log(`ERROR: ${res.data.message}`);
  }
}