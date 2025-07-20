import axios from 'axios';

interface ChatGPTRequest {
  ageRange?: string;
  placeType?: string;
  situation?: string;
}

interface Activity {
  title: string;
  description: string;
  instructions: string;
  tips: string;
  ageRange: string;
  duration: string;
  category: string;
  thingsToAvoid: string;
}

interface ChatGPTResponse {
  advice: string;
  activities: Activity[];
  tips: string[];
}

// Remove OpenAI API key and URL from frontend
// const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
// const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const BACKEND_API_URL = '/api/chatgpt';

// Remove debug logging related to API key
// console.log('🔍 ChatGPT Service Debug Info:');
// console.log('API Key exists:', !!OPENAI_API_KEY);
// console.log('API Key length:', OPENAI_API_KEY ? OPENAI_API_KEY.length : 0);
// console.log('API Key starts with sk-:', OPENAI_API_KEY ? OPENAI_API_KEY.startsWith('sk-') : false);

export const getActivityAdvice = async (request: ChatGPTRequest): Promise<ChatGPTResponse> => {
  // console.log('🚀 getActivityAdvice called with:', request);
  
  // Remove API key check
  // if (!OPENAI_API_KEY) {
  //   console.log('❌ No API key found');
  //   throw new Error('OpenAI API key is not configured. Please add REACT_APP_OPENAI_API_KEY to your environment variables.');
  // }

  try {
    const ageRange = request.ageRange || 'any age';
    const placeType = request.placeType || 'General';
    const situation = request.situation || 'general boredom';
    
    // Build a more detailed and context-aware prompt
    let prompt = `As a parenting expert, I need your help with a specific situation. Please provide personalized advice for keeping a kid occupied without screens.`;
    
    // Add age-specific context
    if (ageRange && ageRange !== 'any age') {
      prompt += `\n\n**Kid's Age:** ${ageRange} years old`;
    }
    
    // Add place-specific context
    if (placeType && placeType !== 'General') {
      prompt += `\n\n**Location/Place:** ${placeType}`;
    }
    
    // Add situation-specific context
    if (situation && situation !== 'general boredom') {
      prompt += `\n\n**Specific Situation:** ${situation}`;
    }
    
    prompt += `\n\nPlease provide personalized advice that specifically considers:
1. Age-appropriate activities for a ${ageRange} year old kid
2. Activities suitable for ${placeType} environment
3. Solutions that address the specific situation: ${situation}

IMPORTANT CONTENT SAFETY: All activities must be completely family-friendly and appropriate for children. Never include any references to adult content, pornography, explicit language, cursing, profanity, violence, or any inappropriate material. All activities should be wholesome, educational, and safe for children of all ages.

MATERIALS CONSTRAINT: Parents will NOT have brought any materials from home. All activities must use ONLY items that are readily available in the ${placeType} environment. For example:
- Restaurant: utensils, napkins, straws, menus, salt/pepper shakers, etc.
- Car ride: seat belts, windows, mirrors, dashboard items, etc.
- Grocery store: shopping cart, products on shelves, price tags, etc.
- Waiting room: magazines, chairs, walls, windows, etc.
- Adult gathering: furniture, decorations, household items, etc.

CRITICAL: Return your response as a valid JSON object with exactly 5 activities labeled A, B, C, D, E. Each activity should be:
- Specifically tailored to a ${ageRange} year old kid
- Suitable for ${placeType} environment
- Relevant to the situation: ${situation}
- Screen-free and engaging
- Completely family-friendly and appropriate for children
- Uses ONLY materials readily available in the ${placeType} environment (no materials brought from home)

The JSON structure should be:
{
  "A": {
    "Activity Title": "[Activity Title]",
    "Description": "[Brief description of the activity]",
    "Instructions": {
      "Step 1": "[First step]",
      "Step 2": "[Second step]",
      "Step 3": "[Third step]"
    },
    "Tips": "[Tips to keep kids entertained and learning]",
    "Age Range": "[Appropriate age range]",
    "Duration": "[Estimated time range]",
    "Category": "[Activity category - Indoor/Outdoor/Creative/Educational/STEM/Physical/etc.]",
    "Things to Avoid": "[Potential issues or things to watch out for]"
  },
  "B": { [same structure as A] },
  "C": { [same structure as A] },
  "D": { [same structure as A] },
  "E": { [same structure as A] }
}

Provide ONLY this JSON object with exactly 5 activities. No additional text, explanations, or markdown formatting.`;

    // console.log('📤 Making API request to backend...');
    // console.log('Request payload:', {
    //   model: 'gpt-3.5-turbo',
    //   messages: [
    //     {
    //       role: 'system',
    //       content: 'You are a helpful parenting expert who specializes in screen-free activities for kids. Always consider the specific age, location/place, and situation provided by the user when giving advice. Provide practical, personalized recommendations that are tailored to the exact circumstances described. Use "kid" and "kids" terminology instead of "child" and "children".'
    //     },
    //     {
    //       role: 'user',
    //       content: prompt
    //     }
    //   ],
    //   max_tokens: 1000,
    //   temperature: 0.7
    // });

    // Call backend instead of OpenAI directly
    const response = await axios.post(
      BACKEND_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
                  {
          role: 'system',
          content: 'You are a helpful parenting expert who specializes in screen-free activities for kids. Always consider the specific age, location/place, and situation provided by the user when giving advice. Provide practical, personalized recommendations that are tailored to the exact circumstances described. Use "kid" and "kids" terminology instead of "child" and "children". You must ALWAYS respond with valid JSON only - no markdown, no explanations, no additional text. The JSON should contain exactly 5 activities labeled A, B, C, D, E with the structure specified in the user prompt. IMPORTANT: All content must be completely family-friendly and appropriate for children. Never include any references to adult content, pornography, explicit language, cursing, profanity, violence, or any inappropriate material. All activities should be wholesome, educational, and safe for children of all ages. CRITICAL: Parents will NOT have brought any materials from home. All activities must use ONLY items that are readily available in the specific location/place mentioned in the user prompt.'
        },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }
    );

    // Log only the HTTP status code from the response
    console.log('HTTP response code:', response.status);
    const advice = response.data.choices ? response.data.choices[0].message.content : response.data.advice;
    // console.log('📄 Raw ChatGPT response:', advice);
    // console.log('📄 Response length:', advice.length);
    // console.log('📄 First 500 characters:', advice.substring(0, 500));
    
    const extractedActivities = extractActivities(advice);
    // console.log('🎯 Extracted activities:', extractedActivities);
    
    return {
      advice,
      activities: extractedActivities,
      tips: extractTips(advice)
    };
  } catch (error: any) {
    console.error('❌ Error calling backend API:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    // Re-throw the error instead of falling back to mock response
    throw error;
  }
};

const extractActivities = (advice: string): Activity[] => {
  // console.log('🔍 Starting activity extraction from:', advice.substring(0, 200) + '...');
  const activities: Activity[] = [];
  
  // Strategy 1: Try to parse as JSON first
  try {
    // Clean up the response to extract just the JSON part
    const jsonMatch = advice.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      // console.log('📋 Found JSON in response, attempting to parse...');
      const parsed = JSON.parse(jsonStr);
      
      // Check if the parsed object has activities as direct properties (A, B, C, D, E)
      const activityKeys = Object.keys(parsed).filter(key => /^[A-E]$/.test(key));
      
      if (activityKeys.length > 0) {
        // console.log('📋 Successfully parsed JSON with direct activity keys:', activityKeys);
        
        activityKeys.forEach((activityKey) => {
          const activityData = parsed[activityKey];
          
          if (activityData && typeof activityData === 'object') {
            const activity: Activity = {
              title: activityData['Activity Title'] || `Activity ${activityKey}`,
              description: activityData['Description'] || 'No description provided',
              instructions: formatInstructions(activityData['Instructions']),
              tips: activityData['Tips'] || 'Have fun and be creative!',
              ageRange: activityData['Age Range'] || 'All ages',
              duration: activityData['Duration'] || '30-60 min',
              category: activityData['Category'] || 'General',
              thingsToAvoid: activityData['Things to Avoid'] || 'None specified'
            };
            
            // console.log(`✅ Extracted activity ${activityKey}:`, activity);
            activities.push(activity);
          }
        });
        
        if (activities.length > 0) {
          return activities;
        }
      }
      
      // Fallback: Check if there's an activities array
      if (parsed.activities && Array.isArray(parsed.activities)) {
        // console.log('📋 Successfully parsed JSON with activities array');
        
        parsed.activities.forEach((activityObj: any, index: number) => {
          // Handle the nested structure: { "A": { ... }, "B": { ... } }
          const activityKey = Object.keys(activityObj)[0]; // "A", "B", "C", etc.
          const activityData = activityObj[activityKey];
          
          if (activityData) {
            const activity: Activity = {
              title: activityData['Activity Title'] || `Activity ${activityKey}`,
              description: activityData['Description'] || 'No description provided',
              instructions: formatInstructions(activityData['Instructions']),
              tips: activityData['Tips'] || 'Have fun and be creative!',
              ageRange: activityData['Age Range'] || 'All ages',
              duration: activityData['Duration'] || '30-60 min',
              category: activityData['Category'] || 'General',
              thingsToAvoid: activityData['Things to Avoid'] || 'None specified'
            };
            
            // console.log(`✅ Extracted activity ${activityKey}:`, activity);
            activities.push(activity);
          }
        });
        
        if (activities.length > 0) {
          return activities;
        }
      }
    }
  } catch (error) {
    // console.log('❌ JSON parsing failed, falling back to text parsing:', error);
  }
  
  // Strategy 2: Fallback to text parsing
  let activitySections: string[] = [];
  
  // Split by A, B, C, D, E
  activitySections = advice.split(/(?=^[A-E]\.)/m).filter(section => section.trim());
  // console.log('📋 Strategy 2 - Found activity sections:', activitySections.length);
  
  // If no sections found, try alternative strategies
  if (activitySections.length <= 1) {
    // Look for numbered activities
    activitySections = advice.split(/(?=^[1-5]\.)/m).filter(section => section.trim());
    // console.log('📋 Strategy 2b - Found numbered sections:', activitySections.length);
  }
  
  if (activitySections.length <= 1) {
    // Look for bullet points or dashes
    activitySections = advice.split(/(?=^[-•*]\s)/m).filter(section => section.trim());
    // console.log('📋 Strategy 2c - Found bullet sections:', activitySections.length);
  }
  
  if (activitySections.length <= 1) {
    // Split by double newlines and look for activity-like content
    const paragraphs = advice.split(/\n\n+/).filter(p => p.trim());
    // console.log('📋 Strategy 2d - Found paragraphs:', paragraphs.length);
    
    // If we have 5+ paragraphs, treat them as activities
    if (paragraphs.length >= 5) {
      activitySections = paragraphs.slice(0, 5);
    }
  }
  
  activitySections.forEach((section, index) => {
    // console.log(`🔍 Processing section ${index + 1}:`, section.substring(0, 100) + '...');
    try {
      const lines = section.split('\n').filter(line => line.trim());
      if (lines.length === 0) return;
      
      // Extract title from first line (e.g., "A. Indoor Treasure Hunt" or "1. Indoor Treasure Hunt")
      let titleMatch = lines[0].match(/^[A-E]\.\s*(.+)/);
      if (!titleMatch) {
        titleMatch = lines[0].match(/^[1-5]\.\s*(.+)/);
      }
      if (!titleMatch) {
        titleMatch = lines[0].match(/^[-•*]\s*(.+)/);
      }
      
      let title: string;
      if (titleMatch) {
        title = titleMatch[1].trim();
      } else {
        // If no numbered title, use the first line as title
        title = lines[0].trim();
      }
      
      // Extract other fields using regex patterns
      const description = extractField(lines, 'Description:');
      const instructions = extractField(lines, 'Instructions:');
      const tips = extractField(lines, 'Tips:');
      const ageRange = extractField(lines, 'Age Range:');
      const duration = extractField(lines, 'Duration:');
      const category = extractField(lines, 'Category:');
      const thingsToAvoid = extractField(lines, 'Things to Avoid:');
      
      if (title) {
        // If we don't have structured fields, try to extract from natural language
        const fullText = lines.join(' ');
        let finalDescription = description;
        let finalInstructions = instructions;
        
        if (!description && !instructions) {
          // Try to extract meaningful content from the text
          const sentences = fullText.split(/[.!?]+/).filter(s => s.trim().length > 10);
          if (sentences.length > 0) {
            const firstSentence = sentences[0].trim();
            const remainingText = sentences.slice(1).join('. ').trim();
            
            finalDescription = firstSentence.length > 50 ? firstSentence : fullText.substring(0, 200);
            finalInstructions = remainingText || 'Follow the activity description above';
          }
        }
        
        const activity = {
          title,
          description: finalDescription || 'No description provided',
          instructions: finalInstructions || 'No instructions provided',
          tips: tips || 'Have fun and be creative!',
          ageRange: ageRange || 'All ages',
          duration: duration || '30-60 min',
          category: category || 'General',
          thingsToAvoid: thingsToAvoid || 'None specified'
        };
        // console.log('✅ Extracted activity:', activity);
        activities.push(activity);
      } else {
        // console.log('❌ No title found for section');
      }
    } catch (error) {
      // console.warn('Failed to parse activity section:', error);
    }
  });
  
  // If we still don't have activities, create a fallback
  if (activities.length === 0) {
    // console.log('⚠️ No activities parsed, creating fallback');
    const fallbackActivity: Activity = {
      title: 'Activity Suggestions',
      description: 'Here are some great screen-free activities for your child:',
      instructions: advice.substring(0, 500) + '...',
      tips: 'Try these activities and see which ones your child enjoys most!',
      ageRange: 'All ages',
      duration: '30-60 min',
      category: 'General',
      thingsToAvoid: 'None specified'
    };
    activities.push(fallbackActivity);
  }
  
  return activities;
};

const formatInstructions = (instructions: any): string => {
  if (typeof instructions === 'string') {
    return instructions;
  }
  
  if (typeof instructions === 'object' && instructions !== null) {
    // Handle the nested structure: { "Step 1": "...", "Step 2": "..." }
    const steps = Object.entries(instructions)
      .filter(([key, value]) => key.startsWith('Step') && typeof value === 'string')
      .sort(([a], [b]) => {
        const stepA = parseInt(a.replace('Step ', ''));
        const stepB = parseInt(b.replace('Step ', ''));
        return stepA - stepB;
      })
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    return steps || 'Follow the activity description above';
  }
  
  return 'Follow the activity description above';
};

const extractField = (lines: string[], fieldName: string): string => {
  const fieldIndex = lines.findIndex(line => line.includes(fieldName));
  if (fieldIndex === -1) return '';
  
  let fieldValue = '';
  let currentIndex = fieldIndex + 1;
  
  // Collect all lines until we hit another field or end
  while (currentIndex < lines.length && 
         !lines[currentIndex].match(/^(Age Range|Duration|Category|Things to Avoid|Tips|Instructions|Description):/)) {
    fieldValue += lines[currentIndex].trim() + ' ';
    currentIndex++;
  }
  
  return fieldValue.trim();
};

const extractTips = (advice: string): string[] => {
  // Simple extraction - in a real app, you might want more sophisticated parsing
  const tipKeywords = ['rotate', 'praise', 'join', 'simple', 'supervise', 'encourage', 'limit'];
  return tipKeywords.filter(keyword => advice.toLowerCase().includes(keyword));
}; 