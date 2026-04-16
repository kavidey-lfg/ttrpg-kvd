import { SystemUpdate } from '../types';

export const parseSystemUpdate = (text: string): { update: SystemUpdate | null; cleanText: string; rawJson: string | null } => {
  // 1. Try to find JSON in backticks first (standard)
  const backtickRegex = /```json\s*([\s\S]*?)\s*```/i;
  const backtickMatch = text.match(backtickRegex);
  
  let jsonString = backtickMatch ? backtickMatch[1] : null;
  let cleanText = text;

  // 2. If no backticks, look for a raw JSON object that contains SYSTEM_UPDATE
  if (!jsonString) {
    const braceRegex = /\{[\s\S]*?"SYSTEM_UPDATE"[\s\S]*?\}/;
    const braceMatch = text.match(braceRegex);
    if (braceMatch) {
      jsonString = braceMatch[0];
    }
  }

  if (jsonString) {
    try {
      // Attempt to parse the found string
      const parsed = JSON.parse(jsonString.trim());
      
      if (parsed && typeof parsed === 'object') {
        // Check for the wrapper or the direct object
        const update = parsed.SYSTEM_UPDATE || (parsed.hp_change || parsed.stats_change || parsed.inventory_add ? parsed : null);
        
        if (update && typeof update === 'object') {
          // Remove the JSON block from the narrative text to get clean narrative
          if (backtickMatch) {
            cleanText = text.replace(backtickRegex, '').trim();
          } else if (jsonString) {
            const lastIndex = text.lastIndexOf(jsonString);
            if (lastIndex !== -1) {
              cleanText = (text.substring(0, lastIndex) + text.substring(lastIndex + jsonString.length)).trim();
            }
          }

          return {
            update: update as SystemUpdate,
            cleanText,
            rawJson: JSON.stringify(update, null, 2)
          };
        }
      }
    } catch (e) {
      console.warn("Found potential JSON but failed to parse:", e);
    }
  }

  return { update: null, cleanText: text, rawJson: null };
};
