import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are CyberGuide, a friendly and knowledgeable AI assistant for people who are completely new to cybersecurity. Your mission is to make cybersecurity accessible, exciting, and actionable for beginners.

Keep your answers:
- Clear and jargon-free (always explain technical terms when you use them)
- Encouraging and motivating
- Practical with concrete next steps
- Well structured but concise — avoid walls of text

Topics you cover:
- What cybersecurity is and why it matters
- Career paths: SOC analyst, penetration tester, GRC analyst, security engineer, incident responder, cloud security, etc.
- Step-by-step learning roadmap for complete beginners
- Entry-level certifications: ISC2 CC, CompTIA Security+, Google Cybersecurity Certificate, CompTIA A+/Network+
- Core concepts explained simply: CIA triad, firewalls, encryption, networking basics, phishing, malware, VPNs, SIEM, etc.
- Free and paid learning resources: TryHackMe, Hack The Box, OWASP, Cybrary, Professor Messer, etc.
- How to build a portfolio and land your first job with zero experience
- Salary expectations and job market outlook

Always end your response with one short, relevant follow-up suggestion or question to keep the learning momentum going.`;

const QUICK_PROMPTS = [
  { label: "🛡️ What is cybersecurity?", text: "What exactly is cybersecurity and why should I care about it?" },
  { label: "🗺️ Beginner roadmap", text: "Give me a step-by-step roadmap to start a career in cybersecurity from zero." },
  { label: "📜 Best entry-level certs", text: "What are the best certifications for someone starting in cybersecurity?" },
  { label: "💼 Job roles explained", text: "What are the different job roles in cybersecurity? Which one should I aim for first?" },
  { label: "🆓 Free resources", text: "What are the best free resources to learn cybersecurity from scratch?" },
  { label: "🏗️ Build a portfolio", text: "How do I build a cybersecurity portfolio with no prior experience?" },
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || "").join("") || "Sorry, something went wrong.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "⚠️ Connection error. Please try again." }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div style={{
      fontFamily: "'Segoe UI', sans-serif",
      background: "#080d1a",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      color: "#e2e8f0",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 20px",
        background: "linear-gradient(90deg, #0d1120, #0a1628)",
        borderBottom: "1px solid #1a2540",
        display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: "50%",
          background: "linear-gradient(135deg, #00c6ff, #0066ff)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, boxShadow: "0 0 12px #0066ff55",
        }}>🛡️</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#00c6ff", letterSpacing: 0.5 }}>CyberGuide</div>
          <div style={{ fontSize: 11, color: "#4a6080" }}>AI-powered cybersecurity mentor</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#22c55e" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
          Online
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "20px 16px",
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: 16 }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🔐</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#00c6ff", marginBottom: 8 }}>
              Welcome to CyberGuide
            </div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 28, lineHeight: 1.6 }}>
              Your AI companion for breaking into cybersecurity.<br />Ask me anything — no experience needed.
            </div>
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 8,
              justifyContent: "center", maxWidth: 500, margin: "0 auto",
            }}>
              {QUICK_PROMPTS.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q.text)}
                  style={{
                    background: "#0d1628", border: "1px solid #1e3a5f",
                    color: "#7aa2c8", padding: "9px 15px", borderRadius: 20,
                    cursor: "pointer", fontSize: 13,
                  }}>
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8 }}>
            {m.role === "assistant" && (
              <div style={{
                width: 30, height: 30, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                background: "linear-gradient(135deg, #00c6ff, #0066ff)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
              }}>🛡️</div>
            )}
            <div style={{
              maxWidth: "74%",
              background: m.role === "user" ? "linear-gradient(135deg, #0055d4, #003fa8)" : "#0d1628",
              border: m.role === "assistant" ? "1px solid #1a2e50" : "none",
              padding: "12px 16px",
              borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              fontSize: 14, lineHeight: 1.65, color: "#dce8f8",
              whiteSpace: "pre-wrap",
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "linear-gradient(135deg, #00c6ff, #0066ff)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
            }}>🛡️</div>
            <div style={{
              background: "#0d1628", border: "1px solid #1a2e50",
              padding: "14px 18px", borderRadius: "18px 18px 18px 4px",
              display: "flex", gap: 5, alignItems: "center",
            }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: "50%", background: "#00c6ff",
                  animation: `bounce 1.2s ${i*0.2}s infinite ease-in-out`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "14px 16px", borderTop: "1px solid #1a2540",
        background: "#0a0f1e", display: "flex", gap: 10, flexShrink: 0,
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Ask anything about cybersecurity..."
          style={{
            flex: 1, background: "#0d1628", border: "1px solid #1a2e50",
            borderRadius: 14, padding: "12px 16px",
            color: "#dce8f8", fontSize: 14, outline: "none",
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          style={{
            background: input.trim() && !loading ? "linear-gradient(135deg, #00c6ff, #0066ff)" : "#0d1628",
            border: "1px solid " + (input.trim() && !loading ? "transparent" : "#1a2e50"),
            borderRadius: 14, width: 48, height: 48,
            cursor: input.trim() && !loading ? "pointer" : "default",
            fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >➤</button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}