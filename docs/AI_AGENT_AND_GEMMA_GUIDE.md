# AI Agent Architecture & Gemma 4 Integration Guide
**OmniAgency OS — Multi-Tenant Agency Operating System**

This guide provides an end-to-end blueprint on:
1. How the tool-using AI Content Agent is architected and integrated into this project.
2. How the open-weights **Gemma 4** model is added, configured, and run alongside **Gemini 3.8 Flash**.
3. Best practices for secure multi-tenant boundaries and human-in-the-loop safety.

---

## 1. What Makes an "AI Agent" vs. a Simple Chatbot?

In traditional chatbots, a model receives a string of text and returns a generic answer. In **OmniAgency OS**, the AI is a **tool-augmented agent** possessing:

1. **Scoped Identity & Role Constraints**:
   - Only users with the `CONTENT_MANAGER` role can invoke the agent (enforced both client-side and server-side in `/server.ts`).
   - The agent is instructed to **never auto-publish** posts without human review.

2. **Tenant Context Awareness**:
   - Every agent request automatically receives customer metadata:
     - `name`: e.g. *Lumina Skin & Wellness* or *Apex Fitness Gear*
     - `brand_voice`: e.g. *Empathetic, scientific, luxurious, glowing*
     - `target_audience`: e.g. *Modern professionals seeking dermatologist rituals*
     - `products_services`: Key product lines and claims
     - `monthly_retainer`: Budget context

3. **Tool Invocations (Function Calling)**:
   The agent can execute 10+ distinct tools:
   - `generate_content_ideas`
   - `generate_caption`
   - `generate_hashtags`
   - `generate_content_calendar`
   - `analyze_previous_posts`
   - `analyze_social_performance`
   - `generate_campaign_ideas`
   - `generate_image_prompt`
   - `create_draft_post`
   - `generate_social_report`

---

## 2. Server-Side Tool Calling Architecture (`/server.ts`)

Following the modern `@google/genai` TypeScript SDK:

```typescript
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';

// 1. Initialize server-side with telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' },
  },
});

// 2. Define tools as FunctionDeclaration[]
const functionDeclarations: FunctionDeclaration[] = [
  {
    name: 'generate_caption',
    description: 'Draft a conversion-focused caption matching exact brand voice.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        topic: { type: Type.STRING, description: 'Topic or product feature' },
        platform: { type: Type.STRING, description: 'Target social platform' },
      },
      required: ['topic', 'platform'],
    },
  },
  // ... other tools
];

// 3. Execute using Gemini 3.8 Flash
const response = await ai.models.generateContent({
  model: 'gemini-3.8-flash',
  contents: userPrompt,
  config: {
    systemInstruction: brandAwareSystemPrompt,
    tools: [{ functionDeclarations }],
  },
});

// 4. Access output via .text property (never response.text())
const generatedText = response.text;
```

---

## 3. How to Add & Run the Gemma 4 Model

**Gemma** is Google's family of lightweight, open-weights models built from the same research and technology used to create Gemini models.

In this project, we support **Gemma 4** through two deployment paths:

### Path A: Zero-Config Embedded Engine (Built-In)
- Automatically active out-of-the-box in `/server.ts`.
- Content Managers can toggle **"Gemma 4"** in the Content Studio workspace without external servers or cloud setup.

### Path B: Self-Hosted / External Gemma 4 Inference Endpoint
To connect a real self-hosted Gemma 4 instance (via **Ollama**, **vLLM**, **Hugging Face TGI**, or **Google Cloud Vertex AI Model Garden**):

1. **Deploy Gemma with Ollama or vLLM**:
   ```bash
   # Example using Ollama
   ollama run gemma:latest

   # Example using vLLM (OpenAI-compatible server on port 8000)
   python -m vllm.entrypoints.openai.api_server \
       --model google/gemma-4-it \
       --port 8000
   ```

2. **Add Environment Variables to `.env`**:
   ```env
   # Point to your Gemma inference container
   GEMMA_API_URL="http://localhost:8000"
   GEMMA_API_KEY="optional-bearer-token"
   ```

3. **Backend Proxy Routing in `/server.ts`**:
   The `/server.ts` endpoint inspects `selectedModel`. If `gemma-4` is requested and `GEMMA_API_URL` is set, it forwards the prompt to your Gemma OpenAI-compatible endpoint:
   ```typescript
   if (selectedModel === 'gemma-4') {
     if (process.env.GEMMA_API_URL) {
       const gemmaRes = await fetch(`${process.env.GEMMA_API_URL}/v1/chat/completions`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           ...(process.env.GEMMA_API_KEY ? { Authorization: `Bearer ${process.env.GEMMA_API_KEY}` } : {}),
         },
         body: JSON.stringify({
           model: 'gemma-4',
           messages: [
             { role: 'system', content: `Brand voice: ${clientContext.brand_voice}` },
             { role: 'user', content: userPrompt }
           ],
           temperature: 0.7,
         }),
       });
       const data = await gemmaRes.json();
       return res.json({
         source: 'gemma-4-external-endpoint',
         text: data.choices[0].message.content,
         model: 'gemma-4',
       });
     }
   }
   ```

---

## 4. The Human-in-the-Loop Content Pipeline

Every post generated by either Gemini 3.8 Flash or Gemma 4 strictly obeys this lifecycle:

```
[ AI GENERATION (Gemini / Gemma 4) ]
               │
               ▼
       [ CREATED AS DRAFT ]
               │
               ▼
[ CONTENT MANAGER REVIEW & EDIT ] ──► (Reject with Editorial Notes)
               │
               ▼
       [ POST APPROVED ]
               │
               ▼
       [ POST SCHEDULED ]
               │
               ▼
       [ POST PUBLISHED ]
 (via Instagram, TikTok, LinkedIn Adapters)
               │
               ▼
    [ PERFORMANCE ANALYSIS ]
```

---

## 5. Summary Table: Gemini 3.8 Flash vs. Gemma 4

| Feature | Gemini 3.8 Flash | Gemma 4 |
| :--- | :--- | :--- |
| **Model Type** | Cloud-native flagship | Open-weights portable |
| **Best For** | Multi-tool function calling, multi-turn reasoning | High-throughput, low latency, fine-tuned brand voice |
| **SDK / Runtime** | `@google/genai` TypeScript SDK | REST / OpenAI-compatible / Ollama / vLLM / Vertex |
| **Role Restriction** | `CONTENT_MANAGER` only | `CONTENT_MANAGER` only |
| **Publishing Safety** | Queued as `DRAFT` | Queued as `DRAFT` |
