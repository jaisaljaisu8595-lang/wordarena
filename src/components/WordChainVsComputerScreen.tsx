import React, { useState, useEffect, useRef } from 'react';
import { Clock, Heart, Send, AlertCircle, ArrowLeft, Trophy, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface WordChainVsComputerScreenProps {
  totalGameTime: number; // total game seconds (e.g. 300)
  turnTime: number; // turn seconds (e.g. 30)
  soundEffects: boolean;
  audioAssistance: boolean;
  playerName?: string;
  onBackToHome: () => void;
}

// Comprehensive offline English word database Set
const AI_WORD_SET = new Set([
  'apple', 'elephant', 'tiger', 'rabbit', 'train', 'nest', 'rose', 'eagle', 'earth',
  'house', 'energy', 'yellow', 'water', 'river', 'radio', 'ocean', 'night', 'hotel', 'lemon',
  'net', 'tomato', 'onion', 'nut', 'toe', 'ear', 'turtle', 'engine', 'envelope',
  'egg', 'goal', 'lion', 'nose', 'east', 'tapestry', 'yarn', 'note', 'elbow', 'window',
  'dog', 'cat', 'bat', 'ant', 'tree', 'edifice', 'eclipse', 'emotion', 'escape', 'expert',
  'extend', 'extra', 'fabric', 'face', 'fact', 'fairy', 'fall', 'family', 'fancy', 'farm',
  'fast', 'father', 'fault', 'fear', 'feather', 'feature', 'fee', 'feed', 'feel', 'fellow',
  'felt', 'female', 'fence', 'fever', 'few', 'field', 'fight', 'figure', 'file', 'fill',
  'film', 'final', 'find', 'fine', 'finger', 'finish', 'fire', 'firm', 'fish', 'fit',
  'five', 'flag', 'flame', 'flat', 'flight', 'floor', 'flower', 'fly', 'focus', 'fold',
  'follow', 'food', 'foot', 'force', 'forest', 'forget', 'fork', 'form', 'fortune', 'forward',
  'found', 'four', 'frame', 'free', 'freeze', 'fresh', 'friend', 'front', 'frost', 'fruit',
  'fuel', 'full', 'fun', 'function', 'funny', 'fur', 'future', 'game', 'garden', 'gate',
  'gather', 'gear', 'general', 'gentle', 'geography', 'get', 'giant', 'gift', 'girl', 'give',
  'glad', 'glass', 'glove', 'go', 'goal', 'goat', 'gold', 'golden', 'golf', 'good',
  'goose', 'gorgeous', 'govern', 'gown', 'grace', 'grade', 'grain', 'grand', 'grant', 'grass',
  'grateful', 'grave', 'gray', 'great', 'green', 'greet', 'grew', 'ground', 'group', 'grow',
  'growth', 'guard', 'guess', 'guest', 'guide', 'guilt', 'guitar', 'gum', 'gun', 'guy',
  'gym', 'habit', 'hair', 'half', 'hall', 'hand', 'handle', 'handsome', 'hang', 'happen',
  'happy', 'harbor', 'hard', 'hardly', 'harm', 'harmony', 'harness', 'harsh', 'hat', 'hate',
  'have', 'hawk', 'hazard', 'he', 'head', 'heal', 'health', 'hear', 'heart', 'heat',
  'heaven', 'heavy', 'heel', 'height', 'held', 'helicopter', 'hell', 'hello', 'help', 'hen',
  'her', 'herb', 'here', 'hero', 'hers', 'hidden', 'hide', 'high', 'highway', 'hill',
  'him', 'himself', 'hind', 'hint', 'hip', 'hire', 'his', 'history', 'hit', 'hold',
  'hole', 'holiday', 'hollow', 'home', 'honest', 'honey', 'honor', 'hook', 'hope', 'horn',
  'horror', 'horse', 'hospital', 'host', 'hot', 'hotel', 'hour', 'house', 'hover', 'how',
  'however', 'huge', 'human', 'humble', 'humor', 'hundred', 'hungry', 'hunt', 'hurdle', 'hurry',
  'hurt', 'husband', 'ice', 'idea', 'ideal', 'identify', 'idle', 'igloo', 'ignore', 'ill',
  'illegal', 'illness', 'illustrate', 'image', 'imagination', 'imitate', 'immediate', 'immense', 'impact', 'imply',
  'import', 'impose', 'impossible', 'impress', 'improve', 'in', 'inch', 'incident', 'include', 'income',
  'increase', 'indeed', 'index', 'indicate', 'indoor', 'industry', 'infant', 'infect', 'infer', 'infinite',
  'inflame', 'influence', 'inform', 'ingredient', 'initial', 'inject', 'injure', 'ink', 'inner', 'innocent',
  'input', 'inquire', 'insect', 'inside', 'insist', 'inspect', 'inspire', 'install', 'instance', 'instant',
  'instead', 'instinct', 'instruct', 'instrument', 'insulate', 'insurance', 'insure', 'intact', 'integer', 'integral',
  'integrate', 'intend', 'intense', 'intent', 'interact', 'interest', 'interior', 'internal', 'interpret', 'interrupt',
  'interval', 'interview', 'into', 'introduce', 'invade', 'invent', 'invest', 'invite', 'involve', 'iron',
  'ironic', 'island', 'isolate', 'issue', 'it', 'item', 'its', 'itself', 'jacket', 'jail',
  'jam', 'january', 'jar', 'jaw', 'jazz', 'jealous', 'jeans', 'jelly', 'jewel', 'job',
  'join', 'joint', 'joke', 'jolly', 'journal', 'journey', 'joy', 'judge', 'juice', 'jump',
  'junction', 'june', 'jungle', 'junior', 'junk', 'jury', 'just', 'justice', 'justify', 'keen',
  'keep', 'key', 'kick', 'kid', 'kill', 'kind', 'king', 'kingdom', 'kiss', 'kit',
  'kitchen', 'kite', 'kitten', 'knee', 'knew', 'knife', 'knock', 'knot', 'know', 'knowledge',
  'lab', 'label', 'labor', 'lace', 'lack', 'ladder', 'lady', 'lake', 'lamp', 'land',
  'landscape', 'lane', 'language', 'lantern', 'large', 'laser', 'last', 'late', 'lately', 'later',
  'laugh', 'launch', 'laundry', 'lava', 'law', 'lawn', 'lawsuit', 'lawyer', 'lay', 'layer',
  'lazy', 'lead', 'leader', 'leaf', 'league', 'leak', 'lean', 'leap', 'learn', 'least',
  'leather', 'leave', 'lecture', 'left', 'leg', 'legal', 'legend', 'leisure', 'lemon', 'lend',
  'length', 'lens', 'lentil', 'leopard', 'less', 'lesson', 'let', 'letter', 'level', 'liar',
  'liberty', 'library', 'license', 'lick', 'lid', 'lie', 'life', 'lift', 'light', 'like',
  'lily', 'limb', 'limit', 'line', 'link', 'lion', 'lip', 'liquid', 'list', 'listen',
  'literary', 'literature', 'little', 'live', 'lively', 'liver', 'load', 'loan', 'local', 'locate',
  'lock', 'locomotive', 'lodge', 'log', 'logic', 'lonely', 'long', 'loop', 'lord', 'lose',
  'loss', 'lost', 'lot', 'loud', 'lounge', 'love', 'lovely', 'low', 'lower', 'loyal',
  'luck', 'lucky', 'luggage', 'lumber', 'lunar', 'lunch', 'lung', 'luxury', 'machine', 'mad',
  'magazine', 'magic', 'magnet', 'magnificent', 'mail', 'main', 'maintain', 'major', 'majority', 'make',
  'male', 'mall', 'man', 'manage', 'manager', 'mandate', 'manifest', 'manipulate', 'mankind', 'manner',
  'manual', 'manufacture', 'many', 'map', 'marble', 'march', 'margin', 'marine', 'mark',
  'market', 'marriage', 'marry', 'mask', 'mass', 'massive', 'master', 'match', 'mate', 'material',
  'math', 'matrix', 'matter', 'maximum', 'may', 'maybe', 'mayor', 'me', 'meal', 'mean',
  'meaning', 'meant', 'measure', 'meat', 'mechanic', 'mechanism', 'medal', 'media', 'medical', 'medicine',
  'medium', 'meet', 'melon', 'melt', 'member', 'memory', 'men', 'mental', 'mention', 'menu',
  'mercy', 'merge', 'merit', 'merry', 'mesh', 'message', 'metal', 'meter', 'method', 'metric',
  'metro', 'microscope', 'middle', 'midnight', 'might', 'mild', 'mile', 'military', 'milk', 'mill',
  'mind', 'mine', 'mineral', 'minimal', 'minimum', 'minister', 'minor', 'minority', 'minute', 'miracle',
  'mirror', 'miserable', 'miss', 'missile', 'mission', 'mistake', 'mix', 'mixture', 'mobile', 'mode',
  'model', 'moderate', 'modern', 'modest', 'modify', 'module', 'moment', 'money', 'monitor', 'monkey',
  'monster', 'month', 'mood', 'moon', 'moral', 'more', 'moreover', 'morning', 'mortgage', 'mosque',
  'most', 'mostly', 'mother', 'motion', 'motor', 'mount', 'mountain', 'mouse', 'mouth', 'move',
  'movement', 'movie', 'much', 'mud', 'multiple', 'multiply', 'municipal', 'murder', 'muscle', 'museum',
  'mushroom', 'music', 'musical', 'must', 'mutual', 'my', 'myself', 'mysterious', 'mystery', 'myth',
  'nail', 'name', 'narrow', 'nation', 'national', 'native', 'natural', 'nature', 'naughty', 'naval',
  'navigate', 'navy', 'near', 'nearby', 'nearly', 'neat', 'necessary', 'neck', 'need',
  'needle', 'negative', 'negotiate', 'neighbor', 'neighborhood', 'neither', 'nephew', 'nerve', 'nest', 'net',
  'network', 'neutral', 'never', 'nevertheless', 'new', 'news', 'newspaper', 'next', 'nice', 'night',
  'nine', 'no', 'noble', 'nobody', 'nod', 'noise', 'nominate', 'none', 'nonetheless', 'noon',
  'nor', 'normal', 'north', 'nose', 'not', 'note', 'nothing', 'notice', 'notion', 'notorious',
  'novel', 'now', 'nowhere', 'nuclear', 'number', 'numerous', 'nurse', 'nut', 'nutrient', 'nutrition',
  'oak', 'oar', 'oat', 'obedience', 'obey', 'object', 'objective', 'obligation', 'observation',
  'observe', 'obstacle', 'obtain', 'obvious', 'occasion', 'occupation', 'occupy', 'occur', 'ocean', 'october',
  'odd', 'odds', 'of', 'off', 'offense', 'offer', 'office', 'officer', 'official', 'often',
  'oh', 'oil', 'ok', 'okay', 'old', 'olive', 'olympic', 'omit', 'on', 'once',
  'one', 'onion', 'online', 'only', 'onto', 'open', 'opera', 'operate', 'opinion', 'opponent',
  'opportunity', 'oppose', 'opposite', 'option', 'orange', 'orbit', 'orchestra', 'order', 'ordinary', 'organ',
  'organic', 'organization', 'organize', 'orient', 'origin', 'original', 'other', 'otherwise', 'ought', 'our',
  'ours', 'ourselves', 'out', 'outcome', 'outdoor', 'outer', 'outfit', 'outlet', 'outline', 'output',
  'outrage', 'outside', 'oven', 'over', 'overall', 'overcome', 'overhead', 'overlook', 'overseas', 'overturn',
  'overview', 'owe', 'owl', 'own', 'owner', 'ownership', 'oxygen', 'oyster', 'pace', 'pack',
  'package', 'packet', 'pad', 'page', 'paid', 'pain', 'paint', 'painter', 'painting', 'pair',
  'palace', 'pale', 'palm', 'pan', 'panel', 'panic', 'panoramic', 'pants', 'paper', 'parade',
  'parallel', 'parameter', 'parcel', 'pardon', 'parent', 'park', 'parking', 'parliament', 'part', 'partial',
  'participant', 'participate', 'particle', 'particular', 'partner', 'partnership', 'party', 'pass', 'passage', 'passenger',
  'passion', 'passive', 'passport', 'password', 'past', 'pasta', 'paste', 'pat', 'patch', 'patent',
  'path', 'patient', 'patrol', 'patron', 'pattern', 'pause', 'pave', 'pavement', 'pay', 'payment',
  'peace', 'peaceful', 'peach', 'peak', 'peanut', 'pear', 'pearl', 'peas', 'peasant', 'peel',
  'peer', 'pen', 'pencil', 'pendulum', 'penetrate', 'penguin', 'peninsula', 'penny', 'pension', 'people',
  'pepper', 'per', 'perceive', 'percent', 'percentage', 'perception', 'perfect', 'perform', 'performance', 'perfume',
  'perhaps', 'period', 'permanent', 'permission', 'permit', 'perpendicular', 'perpetual', 'perplex', 'persecute', 'persist',
  'person', 'personal', 'personality', 'personnel', 'perspective', 'persuade', 'pet', 'petition', 'petrol', 'phase',
  'phenomenon', 'philosopher', 'philosophy', 'phoenix', 'phone', 'photo', 'photograph', 'photographer', 'photography', 'phrase',
  'physical', 'physician', 'physics', 'piano', 'pick', 'picket', 'pickle', 'picture', 'pie', 'piece',
  'pier', 'pig', 'pigeon', 'pile', 'pill', 'pillar', 'pillow', 'pilot', 'pin', 'pinch',
  'pine', 'pink', 'pint', 'pioneer', 'pipe', 'pirate', 'pistol', 'pit', 'pitch', 'pizza',
  'place', 'plague', 'plain', 'plan', 'plane', 'planet', 'planned', 'plant', 'plastic', 'plate',
  'platform', 'play', 'player', 'playful', 'plea', 'plead', 'pleasant', 'please', 'pleasure', 'pledge',
  'plenty', 'plot', 'plow', 'plug', 'plum', 'plunge', 'plus', 'pocket', 'poem', 'poet',
  'poetry', 'point', 'poison', 'polar', 'pole', 'police', 'policy', 'polish', 'polite', 'political',
  'politics', 'poll', 'pollution', 'pond', 'pony', 'pool', 'poor', 'pop', 'popular', 'population',
  'porch', 'pork', 'port', 'portable', 'portion', 'portrait', 'portray', 'pose', 'position', 'positive',
  'possess', 'possession', 'possibility', 'possible', 'post', 'poster', 'postpone', 'pot', 'potato', 'potential',
  'pound', 'pour', 'poverty', 'powder', 'power', 'powerful', 'practical', 'practice', 'prairie', 'praise',
  'pray', 'preach', 'precede', 'precious', 'precise', 'predict', 'prefer', 'pregnant', 'prejudice', 'preliminary',
  'premier', 'premise', 'preparation', 'prepare', 'prescribe', 'presence', 'present', 'preserve', 'president', 'press',
  'pressure', 'prestige', 'presumably', 'presume', 'pretend', 'pretty', 'prevail', 'prevent', 'previous', 'price',
  'pride', 'priest', 'primary', 'prime', 'prince', 'princess', 'principal', 'principle', 'print', 'prior',
  'priority', 'prison', 'private', 'prize', 'probable', 'probe', 'problem', 'procedure', 'proceed', 'process',
  'proclaim', 'produce', 'product', 'production', 'profession', 'professional', 'professor', 'profile', 'profit', 'program',
  'progress', 'prohibit', 'project', 'prominent', 'promise', 'promote', 'prompt', 'proof', 'proper', 'property',
  'proportion', 'proposal', 'propose', 'prospect', 'protect', 'protein', 'protest', 'proud', 'prove', 'provide',
  'province', 'provision', 'provoke', 'psychology', 'pub', 'public', 'publication', 'publicity', 'publish', 'pull',
  'pulse', 'pump', 'punch', 'punish', 'pupil', 'puppy', 'purchase', 'pure', 'purple', 'purpose',
  'purse', 'pursue', 'push', 'put', 'puzzle', 'pyramid', 'quaint', 'quake', 'qualification', 'qualify',
  'quality', 'quantity', 'quarrel', 'quarter', 'queen', 'quest', 'question', 'quick', 'quiet', 'quit',
  'quite', 'quiver', 'quiz', 'quote', 'rack', 'radar', 'radiant', 'radiation', 'radical', 'radio',
  'radish', 'radius', 'rag', 'rage', 'raid', 'rail', 'railway', 'rain', 'rainbow', 'raise', 'rally',
  'ranch', 'random', 'range', 'rank', 'rapid', 'rare', 'rash', 'rate', 'rather', 'ratio', 'rational',
  'raw', 'ray', 'reach', 'react', 'reaction', 'read', 'reader', 'ready', 'real', 'realistic',
  'realize', 'realm', 'rear', 'reason', 'reasonable', 'rebel', 'recall', 'receipt', 'receive', 'recent',
  'reception', 'recipe', 'recognize', 'recommend', 'reconcile', 'record', 'recover', 'recruit', 'rectangle', 'red',
  'reduce', 'refer', 'reference', 'refine', 'reflect', 'reform', 'refuge', 'refusal', 'refuse', 'regard',
  'regime', 'region', 'register', 'regret', 'regular', 'regulate', 'reign', 'reinforce', 'reject', 'relate',
  'relation', 'relationship', 'relative', 'relax', 'release', 'relevant', 'reliable', 'relief', 'religion', 'rely',
  'remain', 'remark', 'remarkable', 'remedy', 'remember', 'remind', 'remote', 'removal', 'remove', 'render',
  'renew', 'rent', 'repair', 'repeat', 'replace', 'reply', 'report', 'represent', 'reproduce', 'republic',
  'reputation', 'request', 'require', 'rescue', 'research', 'resemble', 'reservation', 'reserve', 'reside', 'residence',
  'resident', 'resign', 'resist', 'resistance', 'resolution', 'resolve', 'resort', 'resource', 'respect', 'respond',
  'response', 'responsibility', 'responsible', 'rest', 'restaurant', 'restore', 'restrict', 'result', 'resume', 'retail',
  'retain', 'retire', 'retreat', 'return', 'reveal', 'revenge', 'revenue', 'reverse', 'review', 'revise',
  'revive', 'revolve', 'reward', 'rhythm', 'rice', 'rich', 'rid', 'ride', 'rider', 'ridge',
  'rifle', 'right', 'rigid', 'ring', 'riot', 'rip', 'ripe', 'rise', 'risk', 'rival',
  'river', 'road', 'roar', 'roast', 'rob', 'robot', 'rock', 'rocket', 'rod', 'role',
  'roll', 'romance', 'romantic', 'roof', 'room', 'root', 'rope', 'rose', 'rot', 'rotate',
  'rough', 'round', 'route', 'routine', 'row', 'royal', 'rub', 'rubber', 'ruby', 'ruin',
  'rule', 'rumor', 'run', 'runner', 'rural', 'rush', 'rust', 'sacred', 'sacrifice', 'sad',
  'safe', 'safety', 'sail', 'saint', 'salad', 'salary', 'sale', 'sales', 'salmon', 'salt',
  'salute', 'same', 'sample', 'sand', 'sandwich', 'satellite', 'satisfy', 'sauce', 'sausage', 'save',
  'saving', 'scale', 'scan', 'scandal', 'scarce', 'scare', 'scarf', 'scatter', 'scene', 'scenery',
  'scent', 'schedule', 'scheme', 'scholar', 'school', 'science', 'scientific', 'scientist', 'scissors', 'score',
  'scratch', 'screen', 'screw', 'script', 'scrub', 'sea', 'seal', 'search', 'season', 'seat',
  'second', 'secret', 'secretary', 'section', 'sector', 'secure', 'security', 'see', 'seed', 'seek',
  'seem', 'segment', 'seize', 'seldom', 'select', 'selection', 'self', 'sell', 'semester', 'semi',
  'seminar', 'senate', 'senator', 'send', 'senior', 'sense', 'sensible', 'sensitive', 'sentence', 'sentiment',
  'separate', 'sequence', 'serene', 'series', 'serious', 'servant', 'serve', 'service', 'session', 'set',
  'settle', 'seven', 'several', 'severe', 'sew', 'sex', 'sexual', 'shade', 'shadow', 'shake',
  'shall', 'shallow', 'shame', 'shape', 'share', 'shark', 'sharp', 'shave', 'she', 'shed',
  'sheep', 'sheet', 'shelf', 'shell', 'shelter', 'shield', 'shift', 'shine', 'ship', 'shirt',
  'shiver', 'shock', 'shoe', 'shoot', 'shop', 'shore', 'short', 'shot', 'should', 'shoulder',
  'shout', 'shovel', 'show', 'shrimp', 'shrug', 'shut', 'shy', 'sibling', 'sick', 'side',
  'siege', 'sight', 'sign', 'signal', 'signature', 'significance', 'significant', 'silence', 'silent', 'silk',
  'silly', 'silver', 'similar', 'simple', 'simulate', 'sin', 'since', 'sincere', 'sing', 'singer',
  'single', 'sink', 'sir', 'sister', 'site', 'situation', 'six', 'size', 'skate', 'skeleton',
  'ski', 'skill', 'skin', 'skip', 'skirt', 'sky', 'slab', 'slam', 'slave', 'sleep',
  'sleeve', 'slice', 'slide', 'slight', 'slim', 'slip', 'slope', 'slow', 'slug', 'small',
  'smart', 'smell', 'smile', 'smoke', 'smooth', 'snake', 'snap', 'sneaker', 'snow', 'so',
  'soap', 'soar', 'social', 'society', 'sock', 'soft', 'software', 'soil', 'solar', 'soldier',
  'sole', 'solid', 'solitary', 'solve', 'some', 'somebody', 'somehow', 'someone', 'something', 'sometimes',
  'somewhat', 'somewhere', 'son', 'song', 'soon', 'sophisticated', 'sorrow', 'sorry', 'sort', 'soul',
  'sound', 'soup', 'source', 'south', 'southern', 'souvenir', 'space', 'spade', 'span', 'spare',
  'spark', 'sparrow', 'speak', 'speaker', 'spear', 'special', 'specialist', 'species', 'specific', 'specify',
  'specimen', 'spectacle', 'spectrum', 'speech', 'speed', 'spell', 'spend', 'sphere', 'spice', 'spider',
  'spike', 'spin', 'spirit', 'spiritual', 'split', 'spoil', 'sponge', 'sponsor', 'spoon', 'sport',
  'spot', 'spouse', 'spray', 'spread', 'spring', 'spy', 'square', 'squeeze', 'squirrel', 'stab',
  'stability', 'stable', 'stack', 'staff', 'stage', 'stair', 'stake', 'stall', 'stamp', 'stance',
  'stand', 'standard', 'star', 'starch', 'stare', 'start', 'state', 'statement', 'station', 'statistic',
  'statue', 'status', 'stay', 'steady', 'steak', 'steal', 'steam', 'steel', 'steep', 'steer',
  'stem', 'step', 'stereo', 'stick', 'stiff', 'still', 'sting', 'stir', 'stock', 'stomach',
  'stone', 'stool', 'stoop', 'stop', 'storage', 'store', 'storm', 'story', 'stove', 'straight',
  'strain', 'strand', 'strange', 'stranger', 'strategic', 'strategy', 'stream', 'street', 'strength', 'stress',
  'stretch', 'strict', 'strike', 'string', 'strip', 'stripe', 'stroke', 'strong', 'structural', 'structure',
  'struggle', 'student', 'studio', 'study', 'stuff', 'stumble', 'stun', 'stupid', 'style', 'subject',
  'submit', 'subsequent', 'substance', 'substantial', 'substitute', 'subtle', 'subtract', 'suburb', 'success', 'successful',
  'succession', 'succumb', 'such', 'suck', 'sudden', 'suffer', 'sufficient', 'sugar', 'suggest', 'suggestion',
  'suicide', 'suit', 'suitable', 'suite', 'sum', 'summary', 'summer', 'summit', 'sun', 'sunday',
  'sunlight', 'sunny', 'sunset', 'super', 'superb', 'superficial', 'superior', 'supermarket', 'supper', 'supplement',
  'supply', 'support', 'suppose', 'supreme', 'sure', 'surface', 'surgeon', 'surplus', 'surprise', 'surrender',
  'surround', 'survey', 'survive', 'suspect', 'suspend', 'suspicion', 'sustain', 'swallow', 'swamp', 'swan',
  'swap', 'swarm', 'swear', 'sweat', 'sweater', 'sweep', 'sweet', 'swell', 'swift', 'swim',
  'swing', 'switch', 'sword', 'symbol', 'sympathy', 'symphony', 'symptom', 'syndrome', 'syrup', 'system',
  'table', 'tablet', 'tackle', 'tail', 'tailor', 'take', 'tale', 'talent', 'talk', 'tall',
  'tame', 'tan', 'tank', 'tap', 'tape', 'target', 'task', 'taste', 'tax', 'taxi',
  'tea', 'teach', 'teacher', 'team', 'tear', 'tease', 'technical', 'technique', 'technology', 'teenager',
  'telephone', 'television', 'tell', 'temper', 'temperature', 'template', 'temple', 'temporary', 'tempt', 'ten',
  'tenant', 'tend', 'tendency', 'tender', 'tennis', 'tension', 'tent', 'term', 'terminal', 'terrible',
  'territory', 'terror', 'test', 'text', 'texture', 'than', 'thank', 'that', 'theater', 'theft',
  'their', 'them', 'theme', 'themselves', 'then', 'theology', 'theory', 'therapy', 'there', 'therefore',
  'these', 'they', 'thick', 'thief', 'thin', 'thing', 'think', 'third', 'thirst', 'thirteen',
  'thirty', 'this', 'thorn', 'thorough', 'those', 'though', 'thought', 'thousand', 'thread', 'threat',
  'three', 'threshold', 'thrive', 'throat', 'through', 'throughout', 'throw', 'thumb', 'thunder', 'thus',
  'ticket', 'tide', 'tie', 'tight', 'tile', 'till', 'tilt', 'timber', 'time', 'timid',
  'tin', 'tiny', 'tip', 'tire', 'tired', 'tissue', 'title', 'to',
  'toast', 'tobacco', 'today', 'toe', 'together', 'toilet', 'token', 'tolerance', 'tolerate', 'toll',
  'tomato', 'tomorrow', 'ton', 'tone', 'tongue', 'tonight', 'too', 'tool', 'tooth', 'top',
  'topic', 'torch', 'toss', 'total', 'touch', 'tough', 'tour', 'tourist', 'toward', 'towel',
  'tower', 'town', 'toy', 'trace', 'track', 'tractor', 'trade', 'tradition', 'traffic', 'tragedy',
  'trail', 'train', 'trainer', 'training', 'transfer', 'transform', 'transit', 'translate', 'transparent', 'transport',
  'trap', 'trash', 'travel', 'tray', 'treasure', 'treat', 'treatment', 'treaty', 'tree', 'tremendous',
  'trend', 'trial', 'triangle', 'tribe', 'trick', 'trigger', 'trip', 'triumph', 'troop', 'tropical',
  'trouble', 'trousers', 'truck', 'true', 'truly', 'trunk', 'trust', 'truth', 'try', 'tube',
  'tuesday', 'tuition', 'tumble', 'tumor', 'tune', 'tunnel', 'turkey', 'turn', 'turtle',
  'twelve', 'twenty', 'twice', 'twin', 'twist', 'two', 'type', 'typical', 'tyre', 'ugly',
  'ultimate', 'umbrella', 'unable', 'unanimous', 'uncle', 'under', 'undergo', 'underneath', 'understand', 'undertake',
  'undo', 'unfortunate', 'uniform', 'union', 'unique', 'unit', 'unite', 'unity', 'universal', 'universe',
  'university', 'unknown', 'unless', 'unlike', 'unlikely', 'until', 'unusual', 'up', 'upon', 'upper',
  'upright', 'upset', 'urban', 'urge', 'urgent', 'us', 'use', 'used', 'useful', 'user',
  'usual', 'utility', 'utilize', 'utmost', 'utter', 'vacant', 'vacation', 'vacuum', 'vague', 'valid',
  'valley', 'valuable', 'value', 'valve', 'van', 'vanish', 'variable', 'variation', 'variety', 'various',
  'vary', 'vase', 'vast', 'vegetable', 'vehicle', 'veil', 'velocity', 'velvet', 'venture', 'venue',
  'verb', 'verdict', 'verify', 'version', 'vertical', 'vessel', 'veteran', 'veto', 'via', 'vibrate',
  'vice', 'victim', 'victorious', 'victory', 'video', 'view', 'village', 'vine', 'violate', 'violence',
  'violent', 'virtual', 'virtue', 'virus', 'visible', 'vision', 'visit', 'visitor', 'visual', 'vital',
  'vitamin', 'vivid', 'vocal', 'voice', 'volume', 'voluntary', 'volunteer', 'vote', 'voter', 'voyage',
  'wage', 'wagon', 'waist', 'wait', 'wake', 'walk', 'wall', 'walnut', 'wander', 'want',
  'war', 'ward', 'warehouse', 'warm', 'warn', 'wash', 'waste', 'watch', 'water',
  'wave', 'wax', 'way', 'we', 'weak', 'wealth', 'weapon', 'wear', 'weather', 'weave',
  'web', 'wedding', 'wee', 'weed', 'week', 'weekend', 'weekly', 'weigh', 'weight', 'weird',
  'welcome', 'welfare', 'well', 'west', 'western', 'wet', 'whale', 'what', 'whatever', 'wheat',
  'wheel', 'when', 'whenever', 'where', 'whereas', 'wherever', 'whether', 'which', 'while', 'whisper',
  'whistle', 'white', 'who', 'whoever', 'whole', 'whom', 'whose', 'why', 'wide', 'widespread',
  'wife', 'wild', 'will', 'willing', 'win', 'wind', 'window', 'wine', 'wing', 'winner',
  'winter', 'wipe', 'wire', 'wisdom', 'wise', 'wish', 'wit', 'witch', 'with', 'withdraw',
  'within', 'without', 'witness', 'wolf', 'woman', 'wonder', 'wonderful', 'wood', 'wooden', 'wool',
  'word', 'work', 'worker', 'workforce', 'workshop', 'world', 'worm', 'worry', 'worse', 'worst',
  'worth', 'worthy', 'would', 'wound', 'wrap', 'wreck', 'wrist', 'write', 'writer', 'writing',
  'wrong', 'yard', 'yarn', 'year', 'yell', 'yellow', 'yes', 'yesterday', 'yet',
  'yield', 'you', 'young', 'your', 'yours', 'yourself', 'youth', 'zeal', 'zero', 'zone', 'zoo'
]);

interface HistoryItem {
  playerName: string;
  word: string;
  valid: boolean;
  reason?: string;
}

export const WordChainVsComputerScreen: React.FC<WordChainVsComputerScreenProps> = ({
  totalGameTime,
  turnTime,
  soundEffects,
  audioAssistance,
  playerName = 'You',
  onBackToHome
}) => {
  const [studentLives, setStudentLives] = useState(3);
  const [computerLives, setComputerLives] = useState(3);
  const [currentTurn, setCurrentTurn] = useState<'student' | 'computer'>('student');
  const [currentLetter, setCurrentLetter] = useState('E');
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [totalTimerRemaining, setTotalTimerRemaining] = useState(totalGameTime);
  const [turnTimerRemaining, setTurnTimerRemaining] = useState(turnTime);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [wordInput, setWordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const gameOverRef = useRef<HTMLHeadingElement>(null);

  const stateRef = useRef({
    studentLives,
    computerLives,
    currentTurn,
    currentLetter,
    turnTimerRemaining,
    gameOver,
    winner,
    playerName
  });

  useEffect(() => {
    stateRef.current = {
      studentLives,
      computerLives,
      currentTurn,
      currentLetter,
      turnTimerRemaining,
      gameOver,
      winner,
      playerName
    };
  });

  // Focus Game Over heading on game over
  useEffect(() => {
    if (gameOver && gameOverRef.current) {
      gameOverRef.current.focus();
      const resText = `Game Over. ${winner}. Your lives ${studentLives}. Computer lives ${computerLives}.`;
      soundManager.speak(resText);
    }
  }, [gameOver, winner, studentLives, computerLives]);

  // Initialize random starting letter
  useEffect(() => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'L', 'M', 'P', 'R', 'S', 'T'];
    const initialLetter = letters[Math.floor(Math.random() * letters.length)];
    setCurrentLetter(initialLetter);
    if (audioAssistance) {
      soundManager.speak(`Your turn. Start with letter ${initialLetter}`);
    }
  }, [audioAssistance]);

  // Focus input on student turn
  useEffect(() => {
    if (currentTurn === 'student' && !gameOver && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentTurn, gameOver]);

  // Dual Timers (Total Game Timer + Turn Timer)
  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      // 1. Total Game Timer
      setTotalTimerRemaining(prevTotal => {
        if (prevTotal <= 1) {
          setGameOver(true);
          const res = studentLives > computerLives ? 'YOU WIN!' : studentLives < computerLives ? 'COMPUTER WINS!' : 'DRAW!';
          setWinner(res);
          if (soundEffects) soundManager.play('win');
          return 0;
        }
        return prevTotal - 1;
      });

      // 2. Individual Turn Timer
      setTurnTimerRemaining(prevTurn => {
        if (prevTurn <= 1) {
          // Turn timeout!
          if (currentTurn === 'student') {
            setStudentLives(l => {
              const next = l - 1;
              if (next <= 0) {
                setGameOver(true);
                setWinner('COMPUTER WINS!');
                if (soundEffects) soundManager.play('wrong');
              }
              return next;
            });
            setHistory(h => [{ playerName: playerName || 'You', word: "TIME UP", valid: false, reason: "Time's up!" }, ...h]);
            setCurrentTurn('computer');
          } else {
            setComputerLives(l => {
              const next = l - 1;
              if (next <= 0) {
                setGameOver(true);
                setWinner('YOU WIN!');
              }
              return next;
            });
            setCurrentTurn('student');
          }
          return turnTime;
        }
        return prevTurn - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentTurn, gameOver, turnTime, studentLives, computerLives, soundEffects, playerName]);

  // Computer AI Turn
  useEffect(() => {
    if (currentTurn === 'computer' && !gameOver) {
      const timeout = setTimeout(() => {
        const validAIWords = Array.from(AI_WORD_SET).filter(w => w.startsWith(currentLetter.toLowerCase()) && !usedWords.includes(w));

        if (validAIWords.length > 0) {
          const chosenWord = validAIWords[Math.floor(Math.random() * validAIWords.length)];
          const clean = chosenWord.replace(/[^a-z]/g, '');
          const nextLetter = clean[clean.length - 1].toUpperCase();

          setUsedWords(u => [...u, chosenWord]);
          setCurrentLetter(nextLetter);
          setHistory(h => [{ playerName: 'Computer AI', word: chosenWord.toUpperCase(), valid: true, reason: 'Correct!' }, ...h]);
          if (soundEffects) soundManager.play('correct');
          if (audioAssistance) soundManager.speak(`Computer played ${chosenWord}. Your turn. Start with letter ${nextLetter}`);
          setCurrentTurn('student');
          setTurnTimerRemaining(turnTime);
        } else {
          setGameOver(true);
          setWinner('YOU WIN!');
          if (soundEffects) soundManager.play('win');
        }
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [currentTurn, currentLetter, usedWords, gameOver, turnTime, soundEffects, audioAssistance]);

  // Global F2, F3, and Alt + Left Arrow shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const st = stateRef.current;
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        onBackToHome();
        return;
      }
      if (e.key === 'F2') {
        e.preventDefault();
        e.stopPropagation();
        if (st.currentTurn === 'student' && st.currentLetter && !st.gameOver) {
          const speech = `Your turn. Start with letter ${st.currentLetter}. Type an English word beginning with ${st.currentLetter}.`;
          soundManager.speak(speech);
        }
      } else if (e.key === 'F3') {
        e.preventDefault();
        e.stopPropagation();
        let statusSpeech = '';
        if (st.gameOver) {
          statusSpeech = `Game over. ${st.winner || 'Game over'}. Your lives ${st.studentLives}. Computer lives ${st.computerLives}.`;
        } else {
          statusSpeech = `Your lives ${st.studentLives}. Computer lives ${st.computerLives}. ${st.currentTurn === 'student' ? 'Your turn.' : 'Computer turn.'} ${st.turnTimerRemaining} seconds remaining.`;
        }
        soundManager.speak(statusSpeech);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onBackToHome]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTurn !== 'student' || gameOver) return;

    const rawWord = wordInput.trim();
    const cleanWord = rawWord.toLowerCase().replace(/[^a-z]/g, '');

    let isValid = true;
    let reason = '';

    if (!cleanWord) {
      isValid = false;
      reason = 'Incorrect — please enter a valid English word.';
    } else if (cleanWord[0] !== currentLetter.toLowerCase()) {
      isValid = false;
      reason = `Incorrect — the word must start with ${currentLetter}.`;
    } else if (usedWords.includes(cleanWord)) {
      isValid = false;
      reason = 'Incorrect — this word was already used.';
    } else if (!AI_WORD_SET.has(cleanWord)) {
      isValid = false;
      reason = 'Incorrect — please enter a valid English word.';
    }

    if (isValid) {
      if (soundEffects) soundManager.play('correct');
      setSuccessMessage('Correct!');
      setTimeout(() => setSuccessMessage(''), 1500);
      setUsedWords(u => [...u, cleanWord]);
      const nextLetter = cleanWord[cleanWord.length - 1].toUpperCase();
      setCurrentLetter(nextLetter);
      setHistory(h => [{ playerName: playerName || 'You', word: rawWord.toUpperCase(), valid: true, reason: 'Correct!' }, ...h]);
      setWordInput('');
      setErrorMessage('');
      setCurrentTurn('computer');
      setTurnTimerRemaining(turnTime);
    } else {
      if (soundEffects) soundManager.play('wrong');
      setErrorMessage(reason);
      setStudentLives(l => {
        const next = l - 1;
        if (next <= 0) {
          setGameOver(true);
          setWinner('COMPUTER WINS!');
        }
        return next;
      });
      setHistory(h => [{ playerName: playerName || 'You', word: rawWord || '(empty)', valid: false, reason }, ...h]);
      setWordInput('');
      setCurrentTurn('computer');
      setTurnTimerRemaining(turnTime);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col p-3 md:p-6 selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden">
      
      {/* Screen Reader Live Region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {currentTurn === 'student' ? `Your turn. Start with letter ${currentLetter}. Turn time ${turnTimerRemaining} seconds.` : 'Computer AI is thinking...'}
      </div>

      {/* Game Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 mb-4 shadow-xl">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg md:rounded-xl text-xs md:text-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Menu
        </button>
        <div className="text-center">
          <h1 className="text-xs md:text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
            WORD CHAIN BATTLE
          </h1>
          <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest font-semibold">
            TIME {formatTime(totalTimerRemaining)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-slate-950 border border-slate-800 rounded-lg md:rounded-xl">
          <Clock className="w-4 h-4 md:w-5 md:h-5 text-amber-400 animate-pulse" />
          <span className="font-mono text-sm md:text-xl font-bold text-amber-400">
            {turnTimerRemaining}s
          </span>
        </div>
      </header>

      {!gameOver ? (
        <div className="max-w-4xl w-full mx-auto flex flex-col gap-4 flex-1">
          
          {/* Side-by-side Player Cards */}
          <div className="grid grid-cols-2 gap-3 md:gap-6">
            
            {/* Student Card */}
            <div className={`p-4 rounded-2xl md:rounded-3xl border-2 flex flex-col items-center justify-between transition-all relative overflow-hidden ${
              currentTurn === 'student'
                ? 'bg-indigo-950/80 border-indigo-500 shadow-lg ring-2 ring-indigo-500/50'
                : 'bg-slate-900/95 border-slate-800'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-500" />
              <div className="w-full text-center mb-2">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">YOU</span>
                <span className="text-sm md:text-lg font-black text-white truncate block">{playerName || 'You'}</span>
                {currentTurn === 'student' ? (
                  <span className="inline-block mt-1 px-2.5 py-0.5 bg-amber-400 text-slate-950 font-black rounded-full text-xs shadow animate-pulse">
                    YOUR TURN
                  </span>
                ) : (
                  <span className="inline-block mt-1 text-xs text-slate-400 font-semibold">Waiting</span>
                )}
              </div>

              <div className="flex items-center gap-1.5 my-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-5 h-5 md:w-6 md:h-6 ${
                      i < studentLives ? 'text-rose-500 fill-rose-500 drop-shadow' : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Computer Card */}
            <div className={`p-4 rounded-2xl md:rounded-3xl border-2 flex flex-col items-center justify-between transition-all relative overflow-hidden ${
              currentTurn === 'computer'
                ? 'bg-rose-950/80 border-rose-500 shadow-lg ring-2 ring-rose-500/50'
                : 'bg-slate-900/95 border-slate-800'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500" />
              <div className="w-full text-center mb-2">
                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider block">OPPONENT</span>
                <span className="text-sm md:text-lg font-black text-white truncate block">Computer AI</span>
                {currentTurn === 'computer' ? (
                  <span className="inline-block mt-1 px-2.5 py-0.5 bg-rose-400 text-slate-950 font-black rounded-full text-xs shadow animate-pulse">
                    COMPUTER TURN
                  </span>
                ) : (
                  <span className="inline-block mt-1 text-xs text-slate-400 font-semibold">Waiting</span>
                )}
              </div>

              <div className="flex items-center gap-1.5 my-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-5 h-5 md:w-6 md:h-6 ${
                      i < computerLives ? 'text-rose-500 fill-rose-500 drop-shadow' : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* Current Letter & Input Area */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl md:rounded-3xl p-6 shadow-xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2 block">
              {currentTurn === 'student' ? 'Your Turn — Start With Letter (Press F2 to Repeat)' : "Computer AI is thinking..."}
            </span>
            <div className="text-5xl md:text-7xl font-black text-amber-300 tracking-widest uppercase bg-gradient-to-r from-slate-950 to-indigo-950 border border-indigo-500/40 py-5 px-4 rounded-2xl shadow-inner drop-shadow mb-4">
              {currentLetter}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
              <input
                ref={inputRef}
                type="text"
                value={wordInput}
                onChange={(e) => {
                  setWordInput(e.target.value);
                  setErrorMessage('');
                }}
                disabled={currentTurn !== 'student'}
                placeholder={currentTurn === 'student' ? `Type a word starting with ${currentLetter}...` : 'Waiting for computer...'}
                className="flex-1 px-5 py-4 bg-slate-950 border-2 border-indigo-500/60 rounded-xl md:rounded-2xl text-xl text-white font-bold text-center placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500 shadow-inner disabled:opacity-50"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={currentTurn !== 'student'}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-xl md:rounded-2xl shadow-xl text-lg transition-all cursor-pointer flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5" />
                SUBMIT
              </button>
            </form>

            {errorMessage && (
              <div className="mt-3 py-2 px-4 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs font-bold text-center animate-shake">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="mt-3 py-2 px-4 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-bold text-center animate-bounce">
                {successMessage}
              </div>
            )}
          </div>

          {/* Word History Stream */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Word Chain History
            </h3>
            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
              {history.map((h, i) => (
                <div
                  key={i}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 ${
                    h.valid
                      ? 'bg-slate-950 border-slate-800 text-slate-200'
                      : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                  }`}
                >
                  <span className="text-slate-400">{h.playerName}:</span>
                  <span className="font-bold text-white">{h.word}</span>
                  {h.reason && <span className="text-[10px] text-slate-400">({h.reason})</span>}
                </div>
              ))}
              {history.length === 0 && (
                <p className="text-xs text-slate-500 italic">No words played yet.</p>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* Game Over Screen */
        <div className="max-w-md w-full mx-auto my-auto bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-8 text-center shadow-2xl" role="region" aria-label="Game Over Summary">
          <Trophy className="w-20 h-20 text-amber-400 mx-auto mb-4 animate-bounce" />
          <h1 ref={gameOverRef} tabIndex={-1} className="text-4xl font-black text-white mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">GAME OVER</h1>
          <p className="text-3xl font-extrabold text-amber-400 mb-6">{winner}</p>
          <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
            <div>
              <span className="block text-xs text-slate-400 font-semibold mb-1">Your Lives</span>
              <strong className="text-2xl text-emerald-400">{studentLives}</strong>
            </div>
            <div>
              <span className="block text-xs text-slate-400 font-semibold mb-1">Computer</span>
              <strong className="text-2xl text-rose-400">{computerLives}</strong>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-2xl shadow-xl text-xl transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-400"
            >
              PLAY AGAIN
            </button>
            <button
              onClick={onBackToHome}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl border border-slate-700 transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-400"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}

    </main>
  );
};
