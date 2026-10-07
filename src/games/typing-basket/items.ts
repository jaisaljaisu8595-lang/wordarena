export function getItemIcon(word: string, category: string = 'fruits'): string {
  const w = (word || '').toLowerCase().trim();
  
  if (category === 'fruits') {
    if (w.includes('apple')) return '🍎';
    if (w.includes('banana')) return '🍌';
    if (w.includes('mango')) return '🥭';
    if (w.includes('orange')) return '🍊';
    if (w.includes('grape')) return '🍇';
    if (w.includes('papaya')) return '🍈';
    if (w.includes('pineapple')) return '🍍';
    if (w.includes('watermelon')) return '🍉';
    if (w.includes('guava')) return '🍏';
    if (w.includes('pomegranate')) return '🔴';
    if (w.includes('strawberry')) return '🍓';
    if (w.includes('blueberry')) return '🫐';
    if (w.includes('pear')) return '🍐';
    if (w.includes('peach')) return '🍑';
    if (w.includes('cherry')) return '🍒';
    if (w.includes('kiwi')) return '🥝';
    if (w.includes('lemon')) return '🍋';
    if (w.includes('lime')) return '🟢';
    if (w.includes('coconut')) return '🥥';
    if (w.includes('avocado')) return '🥑';
    if (w.includes('plum')) return '🟣';
    if (w.includes('apricot')) return '🍑';
    return '🍎';
  } else if (category === 'animals') {
    if (w.includes('elephant')) return '🐘';
    if (w.includes('tiger')) return '🐅';
    if (w.includes('rabbit')) return '🐰';
    if (w.includes('lion')) return '🦁';
    if (w.includes('monkey')) return '🐒';
    if (w.includes('giraffe')) return '🦒';
    if (w.includes('zebra')) return '🦓';
    if (w.includes('kangaroo')) return '🛜';
    if (w.includes('dolphin')) return '🐬';
    if (w.includes('penguin')) return '🐧';
    if (w.includes('cheetah')) return '🐆';
    if (w.includes('koala')) return '🐨';
    if (w.includes('panda')) return '🐼';
    if (w.includes('leopard')) return '🐆';
    if (w.includes('gorilla')) return '🦍';
    if (w.includes('hippo')) return '🦛';
    if (w.includes('rhino')) return '🦏';
    if (w.includes('crocodile') || w.includes('alligator')) return '🐊';
    if (w.includes('squirrel')) return '🐿️';
    if (w.includes('wolf')) return '🐺';
    if (w.includes('fox')) return '🦊';
    return '🐾';
  } else if (category === 'vegetables') {
    if (w.includes('carrot')) return '🥕';
    if (w.includes('broccoli')) return '🥦';
    if (w.includes('spinach') || w.includes('cabbage') || w.includes('lettuce')) return '🥬';
    if (w.includes('potato') || w.includes('turnip')) return '🥔';
    if (w.includes('tomato')) return '🍅';
    if (w.includes('cucumber') || w.includes('zucchini')) return '🥒';
    if (w.includes('onion')) return '🧅';
    if (w.includes('garlic')) return '🧄';
    if (w.includes('pepper')) return '🫑';
    if (w.includes('pumpkin')) return '🎃';
    if (w.includes('radish')) return '🥕';
    if (w.includes('mushroom')) return '🍄';
    if (w.includes('eggplant')) return '🍆';
    if (w.includes('pea')) return '🟢';
    if (w.includes('bean')) return '🫘';
    return '🥕';
  } else {
    if (w.includes('keyboard')) return '⌨️';
    if (w.includes('monitor')) return '🖥️';
    if (w.includes('browser')) return '🌐';
    if (w.includes('network') || w.includes('router')) return '🛜';
    if (w.includes('software')) return '💿';
    if (w.includes('hardware')) return '💽';
    if (w.includes('database') || w.includes('storage')) return '💾';
    if (w.includes('algorithm') || w.includes('memory')) return '🧮';
    if (w.includes('compiler') || w.includes('function')) return '⚙️';
    if (w.includes('processor')) return '🧠';
    if (w.includes('firewall') || w.includes('encryption')) return '🛡️';
    if (w.includes('terminal')) return '💻';
    return '💻';
  }
}
