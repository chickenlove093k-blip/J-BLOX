
export const BAD_WORDS = [
  'fuck', 'shit', 'ass', 'bitch', 'crap', 'damn', 'piss', 'dick', 'pussy', 'bastard', 'slut', 'whore'
  // Add more as needed for the authentic experience
];

export const filterBadWords = (text: string): string => {
  let filtered = text;
  BAD_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filtered = filtered.replace(regex, '#'.repeat(word.length));
  });
  return filtered;
};
