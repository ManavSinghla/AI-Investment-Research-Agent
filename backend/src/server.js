import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createResearchAgent } from "./agent.js";

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

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
    
    // We'll use stream() to get node-level updates, but also pass an onProgress callback 
    // for immediate mid-superstep logging.
    const config = {
      configurable: {
        onProgress: (msg, node) => {
          sendEvent("progress", { message: msg, node });
        }
      }
    };
    
    const stream = await agent.stream({ query: company }, { ...config, streamMode: "updates" });

    for await (const update of stream) {
      for (const [nodeName, nodeState] of Object.entries(update)) {
        if (nodeState.logs && nodeState.logs.length > 0) {
          nodeState.logs.forEach(log => {
            sendEvent("progress", { message: log, node: nodeName });
          });
        }
        
        if (nodeName === "fetchFinancialsNode" && nodeState.financials) {
          sendEvent("dimension_financials", nodeState.financials);
        }
        if (nodeName === "fetchNewsNode" && nodeState.news) {
          sendEvent("dimension_news", nodeState.news);
        }
        if (nodeName === "fetchCompetitorsNode" && nodeState.competitors) {
          sendEvent("dimension_competitors", nodeState.competitors);
        }
        if (nodeName === "fetchRisksNode" && nodeState.risks) {
          sendEvent("dimension_risks", nodeState.risks);
        }
        
        if (nodeName === "decisionNode" && nodeState.verdict) {
          sendEvent("result", nodeState.verdict);
        }
      }
    }
    
    sendEvent("done", { message: "Research complete." });
    res.end();
  } catch (error) {
    if (error.message === "AMBIGUOUS_QUERY") {
      sendEvent("ambiguous", { candidates: error.candidates });
    } else {
      console.error("Agent error:", error);
      sendEvent("error", { message: error.message || "An error occurred during research." });
    }
    res.end();
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
