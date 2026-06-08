async function test() {
  const ip = Math.floor(Math.random() * 255) + "." + Math.floor(Math.random() * 255) + ".0.1";
  console.log("Using IP:", ip);
  const res = await fetch("https://text.pollinations.ai/openai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": ip
    },
    body: JSON.stringify({
      model: "openai",
      messages: [{ role: "user", content: "test" }]
    })
  });
  console.log(res.status);
  const text = await res.text();
  console.log(text.substring(0, 200));
}

test();
