// Functions mapping to tool calls
// Define one function per tool call - each tool call should have a matching function
// Parameters for a tool call are passed as an object to the corresponding function

export const get_weather = async ({
  location,
  unit,
}: {
  location: string;
  unit: string;
}) => {
  console.log("location", location);
  console.log("unit", unit);
  const res = await fetch(
    `/api/functions/get_weather?location=${location}&unit=${unit}`
  ).then((res) => res.json());

  console.log("executed get_weather function", res);

  return res;
};

export const get_joke = async () => {
  const res = await fetch(`/api/functions/get_joke`).then((res) => res.json());
  return res;
};

export const sms_generate = async ({
  persona,
  prompt,
}: {
  persona: string;
  prompt: string;
}) => {
  console.log("Generating SMS for persona:", persona, "with prompt:", prompt);
  const res = await fetch(`/api/sms_generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ persona, prompt }),
  }).then((res) => res.json());

  console.log("executed sms_generate function", res);
  return res;
};

export const sms_classify = async ({
  message,
}: {
  message: string;
}) => {
  console.log("Classifying SMS message:", message);
  const res = await fetch(`/api/sms_classify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  }).then((res) => res.json());

  console.log("executed sms_classify function", res);
  return res;
};

export const sms_send = async ({
  message,
  recipients,
}: {
  message: string;
  recipients: string[];
}) => {
  console.log("Sending SMS:", message, "to recipients:", recipients);
  const res = await fetch(`/api/sms_send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, recipients }),
  }).then((res) => res.json());

  console.log("executed sms_send function", res);
  return res;
};

export const functionsMap = {
  get_weather: get_weather,
  get_joke: get_joke,
  sms_generate: sms_generate,
  sms_classify: sms_classify,
  sms_send: sms_send,
};
