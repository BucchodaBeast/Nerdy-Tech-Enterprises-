const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/humanize", async (req, res) => {
  const { system, text } = req.body;

  if (!system || !text) {
    return res.status(400).json({ error: "Missing system or text" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        system: system,
        messages: [{ role: "user", content: text }]
      })
    });

    const data = await response.json();
    console.log("STATUS:", response.status);
    console.log("RESPONSE:", JSON.stringify(data));

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    if (!data.content || data.content.length === 0) {
      return res.status(500).json({ error: "Empty response from Claude" });
    }

    const result = data.content.map(b => b.text || "").join("");
    res.json({ result });

  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

app.get("/", (req, res) => {
  res.json({ status: "Nerdy Techy API is running!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Nerdy Techy API running on port " + PORT));
