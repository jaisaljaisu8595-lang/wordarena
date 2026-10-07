import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import { TYPING_CATEGORIES, shuffleArray } from './src/games/typing-basket/categories.ts';

function getLocalIpAddress(): string {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

const serverFilename: string = typeof __filename !== 'undefined' ? (__filename as string) : (typeof module !== 'undefined' && module.filename ? module.filename : '');
const serverDirname: string = typeof __dirname !== 'undefined' ? (__dirname as string) : (serverFilename ? path.dirname(serverFilename) : process.cwd());

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(express.json());

const distPath = fs.existsSync(path.join(serverDirname, 'dist'))
  ? path.join(serverDirname, 'dist')
  : path.join(serverDirname, '../dist');

const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(distPath);
if (isProd) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('WordArena LAN Server Running.');
  });
}

// Large offline English word database
const COMMON_WORDS = new Set([
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
  'navigate', 'navy', 'near', 'nearby', 'nearly', 'neat', 'necessarily', 'necessary', 'neck', 'need',
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
  'organique', 'organization', 'organize', 'orient', 'origin', 'original', 'other', 'otherwise', 'ought', 'our',
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

interface Player {
  id: string;
  name: string;
  lives: number;
  isHost: boolean;
  eliminated: boolean;
  stats: {
    wordsPlayed: number;
    correctWords: number;
    invalidAttempts: number;
  };
}

interface Room {
  code: string;
  hostId: string;
  players: Player[];
  status: 'lobby' | 'playing' | 'gameover';
  gameType: 'word-chain' | 'typing-basket';
  category: string;
  gameConfig: {
    totalGameTime: number; // seconds (total game duration, e.g. 300)
    turnTime: number; // seconds (turn duration, e.g. 30)
    audioAssistance: boolean;
    soundEffects: boolean;
  };
  currentTurnPlayerIndex: number;
  currentLetter: string;
  usedWords: string[];
  shuffledWords: string[];
  currentTargetWordIndex: number;
  currentTargetWord: string;
  scores: Record<string, number>;
  baskets: Record<string, string[]>;
  timerRemaining: number; // individual turn timer
  totalGameTimerRemaining: number; // total game timer
  winner: string | null;
  history: { playerName: string; word: string; valid: boolean; reason?: string }[];
}

const rooms = new Map<string, Room>();
const timers = new Map<string, NodeJS.Timeout>();

function generateRoomCode(): string {
  let code = '';
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (rooms.has(code));
  return code;
}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('create-room', ({ playerName, totalGameTime, turnTime, gameType, category, config }, callback) => {
    const code = generateRoomCode();
    const validatedTotalGameTime = Number(totalGameTime) || Number(config?.totalGameTime) || 300;
    const validatedTurnTime = Number(turnTime) || Number(config?.turnTime) || 30;

    const player: Player = {
      id: socket.id,
      name: playerName || 'Player 1',
      lives: 3,
      isHost: true,
      eliminated: false,
      stats: { wordsPlayed: 0, correctWords: 0, invalidAttempts: 0 }
    };

    const room: Room = {
      code,
      hostId: socket.id,
      players: [player],
      status: 'lobby',
      gameType: gameType || 'word-chain',
      category: category || 'fruits',
      gameConfig: {
        totalGameTime: validatedTotalGameTime,
        turnTime: validatedTurnTime,
        audioAssistance: config?.audioAssistance ?? false,
        soundEffects: config?.soundEffects ?? false
      },
      currentTurnPlayerIndex: 0,
      currentLetter: '',
      usedWords: [],
      shuffledWords: [],
      currentTargetWordIndex: 0,
      currentTargetWord: '',
      scores: {},
      baskets: {},
      timerRemaining: validatedTurnTime,
      totalGameTimerRemaining: validatedTotalGameTime,
      winner: null,
      history: []
    };

    rooms.set(code, room);
    socket.join(code);
    callback({ success: true, code, room, hostIp: getLocalIpAddress() });
  });

  socket.on('join-room', ({ code, playerName }, callback) => {
    const room = rooms.get(code);
    if (!room) {
      return callback({ success: false, message: 'Room not found. Please check code.' });
    }
    if (room.status !== 'lobby') {
      return callback({ success: false, message: 'Game has already started in this room.' });
    }
    if (room.players.length >= 4) {
      return callback({ success: false, message: 'Room is full (Maximum 4 players).' });
    }

    const nameExists = room.players.some(p => p.name.toLowerCase() === playerName.toLowerCase());
    const finalName = nameExists ? `${playerName} (${room.players.length + 1})` : playerName;

    const player: Player = {
      id: socket.id,
      name: finalName || `Player ${room.players.length + 1}`,
      lives: 3,
      isHost: false,
      eliminated: false,
      stats: { wordsPlayed: 0, correctWords: 0, invalidAttempts: 0 }
    };

    room.players.push(player);
    socket.join(code);
    io.to(code).emit('room-updated', room);
    callback({ success: true, room });
  });

  socket.on('update-config', ({ code, config }) => {
    const room = rooms.get(code);
    if (room && room.hostId === socket.id) {
      room.gameConfig = { ...room.gameConfig, ...config };
      room.timerRemaining = room.gameConfig.turnTime;
      room.totalGameTimerRemaining = room.gameConfig.totalGameTime;
      io.to(code).emit('room-updated', room);
    }
  });

  socket.on('start-game', ({ code }) => {
    const room = rooms.get(code);
    if (room && room.hostId === socket.id && room.players.length >= 2) {
      room.status = 'playing';
      room.winner = null;
      room.history = [];
      room.usedWords = [];
      room.totalGameTimerRemaining = room.gameConfig.totalGameTime || 300;
      room.timerRemaining = room.gameConfig.turnTime || 30;

      if (room.gameType === 'typing-basket') {
        const catData = TYPING_CATEGORIES[room.category] || TYPING_CATEGORIES.fruits;
        room.shuffledWords = shuffleArray(catData.words);
        room.currentTargetWordIndex = 0;
        room.currentTargetWord = room.shuffledWords[0] || 'apple';
        room.scores = {};
        room.baskets = {};
        room.players.forEach(p => {
          room.scores[p.id] = 0;
          room.baskets[p.id] = [];
        });
        io.to(code).emit('game-started', room);
        startTypingBasketTimer(code);
      } else {
        room.currentTurnPlayerIndex = 0;
        const startingLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'L', 'M', 'P', 'R', 'S', 'T'];
        room.currentLetter = startingLetters[Math.floor(Math.random() * startingLetters.length)];
        io.to(code).emit('game-started', room);
        startGameTimers(code);
      }
    }
  });

  socket.on('submit-word', ({ code, word }) => {
    const room = rooms.get(code);
    if (!room || room.status !== 'playing' || room.gameType !== 'word-chain') return;

    const currentPlayer = room.players[room.currentTurnPlayerIndex];
    if (!currentPlayer || currentPlayer.id !== socket.id || currentPlayer.eliminated) {
      return;
    }

    const rawWord = (word || '').trim();
    const cleanWord = rawWord.toLowerCase().replace(/[^a-z]/g, '');
    currentPlayer.stats.wordsPlayed++;

    let isValid = true;
    let reason = '';

    if (!cleanWord) {
      isValid = false;
      reason = 'Incorrect — please enter a valid English word.';
    } else if (cleanWord[0] !== room.currentLetter.toLowerCase()) {
      isValid = false;
      reason = `Incorrect — the word must start with ${room.currentLetter.toUpperCase()}.`;
    } else if (room.usedWords.includes(cleanWord)) {
      isValid = false;
      reason = 'Incorrect — this word was already used.';
    } else if (!COMMON_WORDS.has(cleanWord)) {
      isValid = false;
      reason = 'Incorrect — please enter a valid English word.';
    }

    if (isValid) {
      currentPlayer.stats.correctWords++;
      room.usedWords.push(cleanWord);
      const lastChar = cleanWord[cleanWord.length - 1].toUpperCase();
      room.currentLetter = lastChar;
      room.history.unshift({ playerName: currentPlayer.name, word: rawWord.toUpperCase(), valid: true, reason: 'Correct!' });
      advanceWordChainTurn(code);
    } else {
      currentPlayer.stats.invalidAttempts++;
      currentPlayer.lives--;
      room.history.unshift({ playerName: currentPlayer.name, word: rawWord || '(empty)', valid: false, reason });

      if (currentPlayer.lives <= 0) {
        currentPlayer.eliminated = true;
      }

      const activePlayers = room.players.filter(p => !p.eliminated);
      if (activePlayers.length <= 1) {
        room.status = 'gameover';
        room.winner = activePlayers.length === 1 ? `${activePlayers[0].name} WINS!` : 'DRAW!';
        clearTurnTimer(code);
        io.to(code).emit('game-over', room);
        return;
      } else {
        advanceWordChainTurn(code);
      }
    }

    io.to(code).emit('game-state-updated', room);
  });

  socket.on('submit-typing-word', ({ code, word }) => {
    const room = rooms.get(code);
    if (!room || room.status !== 'playing' || room.gameType !== 'typing-basket') return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player || player.eliminated) return;

    const cleanWord = (word || '').trim().toLowerCase();
    if (cleanWord === room.currentTargetWord.toLowerCase()) {
      room.usedWords.push(cleanWord);
      room.scores[player.id] = (room.scores[player.id] || 0) + 1;
      if (!room.baskets[player.id]) room.baskets[player.id] = [];
      room.baskets[player.id].push(room.currentTargetWord);

      room.currentTargetWordIndex++;
      if (room.currentTargetWordIndex < room.shuffledWords.length) {
        room.currentTargetWord = room.shuffledWords[room.currentTargetWordIndex];
      } else {
        room.status = 'gameover';
        let maxScore = -1;
        let winnerName = 'No one';
        room.players.forEach(p => {
          const sc = room.scores[p.id] || 0;
          if (sc > maxScore) {
            maxScore = sc;
            winnerName = p.name;
          }
        });
        room.winner = `${winnerName} WINS! (All words completed)`;
        clearTurnTimer(code);
        io.to(code).emit('game-over', room);
        return;
      }

      io.to(code).emit('typing-state-updated', room);
    }
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    rooms.forEach((room, code) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const disconnectedPlayer = room.players[playerIndex];
        room.players.splice(playerIndex, 1);

        if (room.status === 'lobby') {
          if (room.players.length > 0 && disconnectedPlayer.isHost) {
            room.players[0].isHost = true;
            room.hostId = room.players[0].id;
          }
          if (room.players.length === 0) {
            rooms.delete(code);
            clearTurnTimer(code);
          } else {
            io.to(code).emit('room-updated', room);
          }
        } else if (room.status === 'playing') {
          disconnectedPlayer.eliminated = true;
          io.to(code).emit('player-disconnected', { playerName: disconnectedPlayer.name, room });

          if (room.gameType === 'word-chain') {
            const activePlayers = room.players.filter(p => !p.eliminated);
            if (activePlayers.length <= 1) {
              room.status = 'gameover';
              room.winner = activePlayers.length === 1 ? `${activePlayers[0].name} WINS!` : 'DRAW!';
              clearTurnTimer(code);
              io.to(code).emit('game-over', room);
            } else {
              if (room.currentTurnPlayerIndex >= room.players.length) {
                room.currentTurnPlayerIndex = 0;
              }
              io.to(code).emit('game-state-updated', room);
            }
          }
        }
      }
    });
  });
});

function advanceWordChainTurn(code: string) {
  const room = rooms.get(code);
  if (!room) return;

  let attempts = 0;
  do {
    room.currentTurnPlayerIndex = (room.currentTurnPlayerIndex + 1) % room.players.length;
    attempts++;
  } while (room.players[room.currentTurnPlayerIndex].eliminated && attempts < room.players.length);

  room.timerRemaining = room.gameConfig.turnTime; // reset individual turn timer
}

function startGameTimers(code: string) {
  clearTurnTimer(code);

  const interval = setInterval(() => {
    const room = rooms.get(code);
    if (!room || room.status !== 'playing') {
      clearTurnTimer(code);
      return;
    }

    // 1. Total Game Timer decrements continuously
    room.totalGameTimerRemaining--;
    if (room.totalGameTimerRemaining <= 0) {
      room.status = 'gameover';
      room.winner = determineWinnerByLives(room);
      clearTurnTimer(code);
      io.to(code).emit('game-over', room);
      return;
    }

    // 2. Individual Turn Timer decrements
    room.timerRemaining--;
    if (room.timerRemaining <= 0) {
      const currentPlayer = room.players[room.currentTurnPlayerIndex];
      currentPlayer.lives--;
      currentPlayer.stats.invalidAttempts++;
      room.history.unshift({ playerName: currentPlayer.name, word: "TIME UP", valid: false, reason: "Time's up!" });

      if (currentPlayer.lives <= 0) {
        currentPlayer.eliminated = true;
      }

      const activePlayers = room.players.filter(p => !p.eliminated);
      if (activePlayers.length <= 1) {
        room.status = 'gameover';
        room.winner = activePlayers.length === 1 ? `${activePlayers[0].name} WINS!` : 'DRAW!';
        clearTurnTimer(code);
        io.to(code).emit('game-over', room);
        return;
      } else {
        advanceWordChainTurn(code);
        io.to(code).emit('game-state-updated', room);
      }
    } else {
      io.to(code).emit('timer-tick', {
        timerRemaining: room.timerRemaining,
        totalGameTimerRemaining: room.totalGameTimerRemaining
      });
    }
  }, 1000);

  timers.set(code, interval);
}

function startTypingBasketTimer(code: string) {
  clearTurnTimer(code);

  const interval = setInterval(() => {
    const room = rooms.get(code);
    if (!room || room.status !== 'playing') {
      clearTurnTimer(code);
      return;
    }

    room.totalGameTimerRemaining--;
    if (room.totalGameTimerRemaining <= 0) {
      room.status = 'gameover';
      let maxScore = -1;
      let winnerName = 'DRAW!';
      let topCount = 0;
      room.players.forEach(p => {
        const sc = room.scores[p.id] || 0;
        if (sc > maxScore) {
          maxScore = sc;
          winnerName = `${p.name} WINS!`;
          topCount = 1;
        } else if (sc === maxScore) {
          topCount++;
        }
      });
      if (topCount > 1) winnerName = 'DRAW!';
      room.winner = winnerName;
      clearTurnTimer(code);
      io.to(code).emit('game-over', room);
    } else {
      io.to(code).emit('timer-tick', {
        timerRemaining: room.totalGameTimerRemaining,
        totalGameTimerRemaining: room.totalGameTimerRemaining
      });
    }
  }, 1000);

  timers.set(code, interval);
}

function determineWinnerByLives(room: Room): string {
  const sorted = [...room.players].sort((a, b) => b.lives - a.lives);
  if (sorted.length >= 2 && sorted[0].lives === sorted[1].lives) {
    return 'DRAW!';
  }
  return `${sorted[0].name} WINS!`;
}

function clearTurnTimer(code: string) {
  const timer = timers.get(code);
  if (timer) {
    clearInterval(timer);
      timers.delete(code);
  }
}

const PORT = process.env.PORT || 3000;
httpServer.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`WordArena server running on port ${PORT} bound to 0.0.0.0`);
});
