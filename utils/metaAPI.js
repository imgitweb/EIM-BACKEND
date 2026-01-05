
const url = "https://graph.facebook.com/<API_VERSION>/<WHATSAPP_BUSINESS_PHONE_NUMBER_ID>/messages";
const headers = {
  "Authorization": "Bearer <ACCESS_TOKEN>",
  "Content-Type": "application/json",
};
const body = {
  messaging_product: "whatsapp",
  to: "<WHATSAPP_USER_PHONE_NUMBER>",
  type: "template",
  template: {
    name: "hello_world",
    language: { code: "en_US" },
  },
};
const response = await fetch(url, {
  method: "POST",
  headers,
  body: JSON.stringify(body),
});
const data = await response.json();
console.log(data);
  