import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createResearchAgent } from "./agent.js";

dotenv.config({ path: '../.env' });

const app = express();
app.use(cors());
app.use(express.json());

const agent = createResearchAgent();

app.get("/api/research", async (req, res) => {
  const company = req.query.company;
  if (!company) {
    return res.status(400).json({ error: "Company name is required." });
  }

  // Setup SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const sendEvent = (type, data) => {
    res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    sendEvent("progress", { message: `Started research for "${company}"...` });
    
    // We can stream state updates from LangGraph using streamEvents or stream.
    // We'll use stream() to get node-level updates.
    const stream = await agent.stream({ query: company }, { streamMode: "updates" });

    for await (const update of stream) {
      for (const [nodeName, nodeState] of Object.entries(update)) {
        if (nodeState.logs && nodeState.logs.length > 0) {
          nodeState.logs.forEach(log => {
            sendEvent("progress", { message: log, node: nodeName });
          });
        }
        
        if (nodeName === "decisionNode" && nodeState.verdict) {
          sendEvent("result", nodeState.verdict);
        }
      }
    }
    
    sendEvent("done", { message: "Research complete." });
    res.end();
  } catch (error) {
    console.error("Agent error:", error);
    sendEvent("error", { message: "An error occurred during research." });
    res.end();
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
