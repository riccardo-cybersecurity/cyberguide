export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    const systemPrompt = `You are CyberGuide, a friendly AI assistant for people new to cybersecurity. Make cybersecurity accessible and actionable for beginners. Keep answers clear, jargon-free, encouraging, and concise. Cover: career paths, learning roadmaps, certifications (ISC2 CC, Security+, Google Cert), core concepts (CIA triad, firewalls, encryption, phishing), free resources (TryHackMe, HackTheBox, Cybrary), and portfolio building. Always end with one follow-up suggestion.`;

    // Prepend system message as first user message (most compatible approach)
    const geminiMessages = [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "Understood! I'm CyberGuide, ready to help beginners learn cybersecurity. What would you like to know?" }] },
      ...messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }))
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: geminiMessages }),
      }
    );

    const data = await response.json();
    console.log("Gemini status:", response.status);
    console.log("Gemini data:", JSON.stringify(data).slice(0, 500));

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      || data.error?.message
      || "Sorry, something went wrong.";

    res.status(200).json({ content: [{ type: "text", text }] });

  } catch (err) {
    console.error("Handler error:", err.message);
    res.status(500).json({ content: [{ type: "text", text: "Server error: " + err.message }] });
  }
}