export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;

  const systemPrompt = `You are CyberGuide, a friendly and knowledgeable AI assistant for people who are completely new to cybersecurity. Your mission is to make cybersecurity accessible, exciting, and actionable for beginners.

Keep your answers:
- Clear and jargon-free (always explain technical terms when you use them)
- Encouraging and motivating
- Practical with concrete next steps
- Well structured but concise — avoid walls of text

Topics you cover:
- What cybersecurity is and why it matters
- Career paths: SOC analyst, penetration tester, GRC analyst, security engineer, cloud security, etc.
- Step-by-step learning roadmap for complete beginners
- Entry-level certifications: ISC2 CC, CompTIA Security+, Google Cybersecurity Certificate
- Core concepts: CIA triad, firewalls, encryption, networking basics, phishing, malware, VPNs, SIEM
- Free resources: TryHackMe, Hack The Box, OWASP, Cybrary, Professor Messer
- How to build a portfolio and land your first job with zero experience

Always end your response with one short follow-up suggestion to keep the learning momentum going.`;

  // Convert messages to Gemini format
  const geminiMessages = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: geminiMessages,
      }),
    }
  );

  const data = await response.json();
console.log("Gemini response:", JSON.stringify(data));
const text = data.candidates?.[0]?.content?.parts?.[0]?.text || data.error?.message || "Sorry, something went wrong.";
  // Return in same format as Anthropic so the frontend works without changes
  res.status(200).json({ content: [{ type: "text", text }] });
}
