// A tiny literal dictionary representing a subset of GPT-2/3's 50,257 vocab
export const bpe_dict = {
  "Data": 8585,
  " visualization": 18451,
  " emp": 28711,
  "owers": 5921,
  " users": 3726,
  "The": 464,
  " cat": 3797,
  " sat": 3332,
  " on": 319,
  " the": 262,
  " mat": 2603,
  " un": 250,
  "happi": 1823,
  "ness": 321,
  " to": 284,
  " be": 307
};

// Fallback hash to generate consistent "fake" IDs for words not in our mini-dictionary
export function getTokenID(word) {
  if (bpe_dict[word]) return bpe_dict[word];
  let hash = 0;
  for (let i = 0; i < word.length; i++) hash = ((hash << 5) - hash) + word.charCodeAt(i);
  return Math.abs(hash) % 50257; // Keep within vocab size
}
