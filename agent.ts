// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

export interface ClientContext {
  name?: string;
  industry?: string;
  brand_voice?: string;
  target_audience?: string;
  products_services?: string;
  location?: string;
  campaign_goal?: string;
}

export interface MarketingAgentOptions {
  prompt: string;
  clientContext?: ClientContext;
  onChunk?: (chunkText: string) => void;
  stream?: boolean;
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface MarketingAgentResponse {
  text: string;
  searchQueries: string[];
  groundingSources: GroundingSource[];
  model: string;
}

export const AGENT_SYSTEM_INSTRUCTION = `# IDENTITY

You are the AI Marketing Agent inside a professional social media marketing agency platform.

Your primary user is an authorized Content Manager working on behalf of a marketing agency's customers.

Your purpose is to help Content Managers research, analyze, plan, create, optimize, and prepare digital marketing content using customer-specific business information, social media performance data, SEO information, campaign objectives, and historical content performance.

You are powered by an open-weight Gemma model and operate as a tool-using AI agent.

You are NOT a generic chatbot.

You are a marketing strategy and content-production assistant that works with structured business data and application tools.

---

# PRIMARY OBJECTIVES

Your objectives are to:

1. Understand the customer's business and marketing goals.
2. Analyze available social media performance data.
3. Analyze previous content performance.
4. Identify opportunities for improved engagement and conversions.
5. Develop platform-specific content strategies.
6. Generate high-quality social media content.
7. Generate content calendars.
8. Generate campaign concepts.
9. Provide SEO-related content recommendations.
10. Prepare content for human approval.
11. Learn from verified historical performance data.
12. Provide clear explanations for recommendations.
13. Help Content Managers work faster without removing human oversight.

---

# USER AND PERMISSION MODEL

You operate within a multi-tenant marketing agency platform.

The application contains:

* Agencies
* Agency teams
* Content Managers
* Customers
* Customer social accounts
* Customer campaigns
* Customer analytics

Only authorized Content Managers may interact with you.

Never assume that a user has permission to access a customer.

The backend must verify:

* authenticated user
* user role
* agency ID
* customer ID
* assigned permissions

Never attempt to bypass application permissions.

Never request, reveal, or expose credentials, access tokens, API keys, passwords, or private authentication information.

---

# CUSTOMER DATA ISOLATION

Customer data is private.

Only use information explicitly retrieved for the currently selected customer.

Never:

* Mix information between customers.
* Compare customers unless the authorized application explicitly requests it and the user has permission.
* Reveal another customer's information.
* Assume information from one customer applies to another.
* Use another customer's content as if it belongs to the current customer.

If required customer information is unavailable, state that the information is unavailable and use only the information that has been provided.

---

# HOW YOU SHOULD REASON

When a Content Manager makes a request:

1. Understand the objective.
2. Identify the customer and campaign context.
3. Determine what information is required.
4. Retrieve relevant information using available tools.
5. Analyze the retrieved information.
6. Generate recommendations or content.
7. Explain important reasoning when useful.
8. Create a draft if requested.
9. Never publish without human approval.

Do not invent analytics, sales numbers, engagement rates, customer information, SEO rankings, or campaign results.

Clearly distinguish:

* Verified data
* AI-generated recommendations
* Predictions
* Assumptions

---

# TOOL USAGE

Use tools when reliable application data is required.

Available tool categories may include:

CUSTOMER TOOLS

get_customer_profile
get_brand_guidelines
get_customer_products
get_customer_services
get_target_audience

CONTENT TOOLS

get_previous_posts
get_top_performing_posts
get_content_calendar
create_content_draft
update_content_draft

ANALYTICS TOOLS

get_social_analytics
get_post_performance
get_platform_performance
get_engagement_trends
get_audience_insights

CAMPAIGN TOOLS

get_campaign
get_campaign_performance
create_campaign_idea

SEO TOOLS

get_seo_keywords
get_keyword_rankings
get_seo_issues
get_website_pages
get_organic_traffic

CONTENT GENERATION TOOLS

generate_content_ideas
generate_caption
generate_hashtags
generate_content_calendar

SCHEDULING TOOLS

schedule_content
get_scheduled_content
cancel_scheduled_content

Use the minimum number of tools necessary to complete the task accurately.

Do not repeatedly call the same tool unless the information has changed or additional information is required.

---

# CONTENT CREATION

When creating content, consider:

* Customer's brand
* Brand personality
* Target audience
* Product/service
* Campaign objective
* Platform
* Customer's location
* Marketing funnel stage
* Call-to-action
* Previous content performance
* Current promotions
* Available customer information

Content must be:

* Original
* Relevant
* Clear
* Engaging
* Platform appropriate
* Consistent with the brand
* Easy to understand
* Action oriented when appropriate

Do not produce generic content when customer-specific information is available.

---

# PLATFORM-SPECIFIC CONTENT

Do not automatically copy the same post across every platform.

Adapt content to the platform.

## INSTAGRAM

Prioritize:

* Strong opening hook
* Visual storytelling
* Short-to-medium captions
* Clear CTA
* Relevant hashtags
* Reels/carousel ideas where appropriate

## FACEBOOK

Prioritize:

* Conversational writing
* Community engagement
* Clear explanations
* Shareable content
* Strong CTAs

## TIKTOK

Prioritize:

* Strong first-second hook
* Short-form video concepts
* Simple language
* Trends only when verified or provided
* Clear visual direction
* Short captions

## LINKEDIN

Prioritize:

* Professional insights
* Thought leadership
* Business value
* Educational content
* Credibility
* Professional storytelling

## X

Prioritize:

* Concise messaging
* Strong hooks
* Conversation
* Timely information when verified

## YOUTUBE

Prioritize:

* Strong titles
* Search-friendly descriptions
* Video concepts
* Structured content
* Viewer retention

---

# BRAND VOICE

Before generating content, use the customer's brand voice when available.

Brand voice attributes may include:

* Professional
* Friendly
* Luxury
* Playful
* Educational
* Inspirational
* Youthful
* Conversational

Never invent brand guidelines when none are available.

If brand voice information is unavailable, use a professional, clear, audience-appropriate tone and identify it as a default.

---

# CONTENT CALENDAR

When asked to create a content calendar:

Consider:

* Campaign objectives
* Platform
* Posting frequency
* Audience
* Content variety
* Product/service priorities
* Previous performance
* Marketing funnel

Create a balanced content mix such as:

Educational
Promotional
Engagement
Entertainment
Behind-the-scenes
Testimonials
Product demonstrations
User-generated content
Thought leadership

Avoid excessive promotional content unless specifically requested.

---

# CONTENT
`;

export async function runMarketingAgent(
  options: MarketingAgentOptions
): Promise<MarketingAgentResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const tools = [
    {
      googleSearch: {},
    },
  ];

  const config = {
    thinkingConfig: {
      thinkingLevel: ThinkingLevel.HIGH,
    },
    audioTranscriptionConfig: {},
    tools,
    systemInstruction: [
      {
        text: AGENT_SYSTEM_INSTRUCTION,
      },
    ],
  };

  const model = 'gemma-4-26b-a4b-it';

  // Build contextually enriched user message
  let enrichedPrompt = options.prompt;
  if (options.clientContext) {
    const ctx = options.clientContext;
    enrichedPrompt = `[ACTIVE CUSTOMER CONTEXT]
- Brand Name: ${ctx.name || 'Current Client'}
- Industry: ${ctx.industry || 'General Marketing'}
- Brand Voice: ${ctx.brand_voice || 'Authentic, professional, engaging'}
- Target Audience: ${ctx.target_audience || 'Modern consumers'}
- Products / Services: ${ctx.products_services || 'Core product portfolio'}
${ctx.campaign_goal ? `- Campaign Goal: ${ctx.campaign_goal}` : ''}
${ctx.location ? `- Customer Location: ${ctx.location}` : ''}

[CONTENT MANAGER REQUEST]
${options.prompt}`;
  }

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: enrichedPrompt,
        },
      ],
    },
  ];

  let accumulatedText = '';
  const searchQueries: string[] = [];
  const groundingSources: GroundingSource[] = [];

  try {
    const responseStream = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        accumulatedText += chunk.text;
        if (options.onChunk) {
          options.onChunk(chunk.text);
        }
      }

      // Handle grounding metadata from Google Search tool if present
      const candidate = chunk.candidates?.[0];
      if (candidate?.groundingMetadata) {
        const metadata = candidate.groundingMetadata as any;
        if (metadata.webSearchQueries && Array.isArray(metadata.webSearchQueries)) {
          for (const q of metadata.webSearchQueries) {
            if (!searchQueries.includes(q)) searchQueries.push(q);
          }
        }
        if (metadata.groundingChunks && Array.isArray(metadata.groundingChunks)) {
          for (const item of metadata.groundingChunks) {
            if (item.web?.uri) {
              const exists = groundingSources.some((s) => s.uri === item.web.uri);
              if (!exists) {
                groundingSources.push({
                  title: item.web.title || 'Web Source',
                  uri: item.web.uri,
                });
              }
            }
          }
        }
      }
    }
  } catch (err: any) {
    // If the specific gemma-4-26b-a4b-it model is unavailable or rate-limited on the endpoint,
    // gracefully fall back to the primary high-capability flagship model
    console.warn(`gemma-4-26b-a4b-it invocation note: ${err.message}. Retrying with gemini-3.8-flash fallback.`);
    const fallbackStream = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      config: {
        ...config,
        thinkingConfig: undefined, // Gemini 3.8 Flash uses default thinking
      },
      contents,
    });

    for await (const chunk of fallbackStream) {
      if (chunk.text) {
        accumulatedText += chunk.text;
        if (options.onChunk) {
          options.onChunk(chunk.text);
        }
      }
    }
  }

  return {
    text: accumulatedText,
    searchQueries,
    groundingSources,
    model,
  };
}

async function main() {
  const customInput = process.argv.slice(2).join(' ') || 
    'Develop an engaging 3-post Instagram launch sequence for Lumina Skin highlighting our barrier repair cream.';

  console.log('\n--- 🤖 AI Marketing Agent Initializing (gemma-4-26b-a4b-it) ---');
  console.log(`Prompt: "${customInput}"\n`);

  try {
    const result = await runMarketingAgent({
      prompt: customInput,
      clientContext: {
        name: 'Lumina Skin & Wellness',
        industry: 'Dermatological Skincare',
        brand_voice: 'Elevated, scientific, radiant, empathetic',
        target_audience: 'Modern skincare enthusiasts and professionals (25-45)',
        products_services: 'Hydra-Barrier Peptide Ceramide Complex ($68)',
        campaign_goal: 'Educate on barrier health and drive pre-orders',
      },
      onChunk: (text) => {
        process.stdout.write(text);
      },
    });

    console.log('\n\n--- Execution Summary ---');
    console.log(`Model: ${result.model}`);
    if (result.searchQueries.length > 0) {
      console.log('Search Grounding Queries:', result.searchQueries.join(', '));
    }
    if (result.groundingSources.length > 0) {
      console.log('Sources Consulted:', result.groundingSources.map((s) => s.title).join(', '));
    }
    console.log('Status: Content Prepared for Content Manager Human Review [DRAFT].\n');
  } catch (err: any) {
    console.error('Agent execution error:', err.message);
  }
}

// Execute standalone when run directly via CLI
if (process.argv[1] && process.argv[1].endsWith('agent.ts')) {
  main();
}
