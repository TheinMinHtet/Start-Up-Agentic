import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export async function runOnboardingAgent(userMessage, chatHistory, location, category, apiKey, language = 'en') {
  if (!apiKey) throw new Error('API key is missing.');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    systemInstruction: `You are a friendly, expert startup incubator agent interviewing an entrepreneur.
Their business operates in the '${location}' setting, within the '${category}' category.

YOUR STRICT OBJECTIVE:
Guide the user through EXACTLY 6 essential questions in order. Provide 3-4 clickable multiple-choice options for each question, customized dynamically based on their category ('${category}'), operational setting ('${location}'), and their previous answers.

THE 6 MANDATORY QUESTIONS IN ORDER:
1. Product/Service Offering: What core product or service are they building?
2. Target Audience: Who is their primary customer segment?
3. Core Pain Point / Problem: What critical problem or unmet need does this solve for them?
4. Target Country / Operating Region: Where will this business be launched and operated? (e.g. Myanmar, Singapore, Southeast Asia, Global)
5. Budget & Capital: What is their estimated startup capital / budget? (Provide realistic currency options e.g., MMK or USD depending on region).
6. Launch Timeline: When are they aiming to launch? (e.g., Within 1 month, 3 months, 6 months, 1 year).

RULES:
- Ask ONLY ONE question at a time.
- Provide 3 to 4 intelligent, context-specific suggestion options ('options' array) tailored to '${category}' and '${location}' and what the user has said so far.
- 'current_step' MUST be an integer from 1 to 6 indicating which question number you are currently asking (1 for question 1, 2 for question 2, etc.).
- 'requirements_met_count' MUST be an integer from 0 to 6 representing how many questions the user has answered so far.
- When the user answers Question 6 (or has answered all 6), set "is_complete": true, "requirements_met_count": 6, and populate "startup_idea_summary" and "business_info_payload".
- In "reply_message", briefly acknowledge their previous input (1 friendly sentence) and state the question clearly.
- Language: Please reply in ${language === 'mm' ? 'Burmese' : 'English'}.
`,
  });

  const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
      reply_message: {
        type: SchemaType.STRING,
        description: "Your friendly response and question text to the user."
      },
      current_step: {
        type: SchemaType.INTEGER,
        description: "The question number currently being asked, from 1 to 6."
      },
      options: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: "3 to 4 tailored multiple-choice options or recommendations for the user to pick from."
      },
      is_complete: {
        type: SchemaType.BOOLEAN,
        description: "Set to true when all 6 questions have been answered."
      },
      requirements_met_count: {
        type: SchemaType.INTEGER,
        description: "An integer from 0 to 6 indicating how many of the 6 questions have been successfully answered."
      },
      startup_idea_summary: {
        type: SchemaType.STRING,
        description: "A comprehensive 2-3 sentence pitch of the startup. Only populate when is_complete is true."
      },
      business_info_payload: {
        type: SchemaType.OBJECT,
        description: "Only populate when is_complete is true.",
        properties: {
          title: { type: SchemaType.STRING, description: "A catchy name or title for the idea" },
          location: { type: SchemaType.STRING, description: "Online, Offline, or Both" },
          target_country: { type: SchemaType.STRING, description: "The specific country or region e.g. Myanmar, Singapore" },
          budget: { type: SchemaType.STRING },
          target_customers: { type: SchemaType.STRING },
          business_type: { type: SchemaType.STRING },
          goal: { type: SchemaType.STRING, description: "local, scalable, or online" },
          core_painpoint: { type: SchemaType.STRING },
          launch_timeline: { type: SchemaType.STRING }
        },
        required: ["title", "location", "target_country", "budget", "target_customers", "business_type", "goal", "core_painpoint", "launch_timeline"]
      }
    },
    required: ["reply_message", "is_complete", "requirements_met_count", "current_step", "options"]
  };

  const generationConfig = {
    temperature: 0.7,
    responseMimeType: "application/json",
    responseSchema: responseSchema,
  };

  // Build conversation history
  const contents = chatHistory.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  // Add latest message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  try {
    const result = await model.generateContent({
      contents,
      generationConfig
    });

    const textOutput = result.response.text();
    const jsonOutput = JSON.parse(textOutput);
    return jsonOutput;
  } catch (err) {
    console.error("Error in runOnboardingAgent:", err);
    throw err;
  }
}
