const twilio = require("twilio");

const accountSid = "AC6e782d78e4dadfcb7229eff701d378c2"; 
const authToken = "e2b739ccf5a0a451a4a7ac9f4d0cee70"; 
const fromPhone = "+17753698040";

const client = twilio(accountSid, authToken);

async function sendSMS(toPhoneNumber, message) {
  try {
    const response = await client.messages.create({
      body: message,             
      from: fromPhone,           
      to: toPhoneNumber,   
    });
    console.log("SMS sent:", response.sid); 
    return true;
  } catch (error) {
    console.log(toPhoneNumber, message)
    console.error("Error sending SMS:", error);
    throw new Error("Không thể gửi SMS. Vui lòng kiểm tra cấu hình.");
  }
}

module.exports = { sendSMS };