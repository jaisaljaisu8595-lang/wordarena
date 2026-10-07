// Typing Basket Challenge Categories and Word Pools (20+ words each)

export interface CategoryData {
  id: string;
  name: string;
  words: string[];
}

export const TYPING_CATEGORIES: Record<string, CategoryData> = {
  fruits: {
    id: 'fruits',
    name: 'Fruits',
    words: [
      'apple', 'banana', 'mango', 'orange', 'grapes', 'papaya', 'pineapple', 
      'watermelon', 'guava', 'pomegranate', 'strawberry', 'blueberry', 'pear', 
      'peach', 'cherry', 'kiwi', 'lemon', 'lime', 'coconut', 'avocado', 'plum', 'apricot'
    ]
  },
  animals: {
    id: 'animals',
    name: 'Animals',
    words: [
      'elephant', 'tiger', 'rabbit', 'lion', 'monkey', 'giraffe', 'zebra', 
      'kangaroo', 'dolphin', 'penguin', 'cheetah', 'koala', 'panda', 'leopard', 
      'gorilla', 'hippopotamus', 'rhinoceros', 'crocodile', 'alligator', 'squirrel', 'wolf', 'fox'
    ]
  },
  vegetables: {
    id: 'vegetables',
    name: 'Vegetables',
    words: [
      'carrot', 'broccoli', 'spinach', 'potato', 'tomato', 'cucumber', 'cabbage', 
      'lettuce', 'onion', 'garlic', 'pepper', 'pumpkin', 'radish', 'mushroom', 
      'celery', 'zucchini', 'eggplant', 'turnip', 'beetroot', 'pea', 'bean', 'aspasragus'
    ]
  },
  computer: {
    id: 'computer',
    name: 'Computer Words',
    words: [
      'keyboard', 'monitor', 'browser', 'network', 'software', 'hardware', 'database', 
      'algorithm', 'compiler', 'function', 'variable', 'pointer', 'router', 'server', 
      'firewall', 'bandwidth', 'encryption', 'processor', 'memory', 'storage', 'terminal', 'syntax'
    ]
  }
};

// Fisher-Yates shuffle algorithm
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
