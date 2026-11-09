import { chop, DUMP_EXAMPLE, guessSize } from './chop';

describe('chop', () => {
  it('splits a messy dump into clean bites', () => {
    expect(chop(DUMP_EXAMPLE).map((b) => b.text)).toEqual([
      'Text mom back',
      'Laundry',
      'Email my prof about the essay',
      'Buy oat milk',
      'Clean my desk',
      'Water the plant',
    ]);
  });

  it('splits "and" only before a verb', () => {
    expect(chop('salt and pepper chips').map((b) => b.text)).toEqual(['Salt and pepper chips']);
    expect(chop('call grandma and book the dentist').map((b) => b.text)).toEqual(['Call grandma', 'Book the dentist']);
  });

  it('strips list marks and filler, drops empties and duplicates', () => {
    expect(chop('- gotta do dishes\n1. do dishes\n\n,,, ok\n• i really need to vacuum').map((b) => b.text)).toEqual([
      'Do dishes',
      'Vacuum',
    ]);
  });

  it('caps the count', () => {
    expect(chop(Array.from({ length: 40 }, (_, i) => `thing ${i}`).join('\n'))).toHaveLength(20);
  });

  it('guesses sizes from keywords', () => {
    expect(guessSize('text mom')).toBe(1);
    expect(guessSize('take out the trash')).toBe(0);
    expect(guessSize('laundry')).toBe(2);
    expect(guessSize('email my prof about the essay')).toBe(1);
    expect(guessSize('write the essay intro')).toBe(3);
    expect(guessSize('buy oat milk')).toBe(1);
  });

  it('splits French dumps on et (before a verb), puis, ensuite, aussi', () => {
    expect(chop('réviser la philo et faire la fiche d’histoire et ranger ma chambre').map((b) => b.text)).toEqual([
      'Réviser la philo',
      'Faire la fiche d’histoire',
      'Ranger ma chambre',
    ]);
    expect(chop('je dois appeler la banque puis faire les courses et puis la lessive ensuite le ménage aussi arroser les plantes').map((b) => b.text)).toEqual([
      'Appeler la banque',
      'Faire les courses',
      'La lessive',
      'Le ménage',
      'Arroser les plantes',
    ]);
    expect(chop('sel et poivre').map((b) => b.text)).toEqual(['Sel et poivre']);
  });

  it('guesses French sizes too', () => {
    expect(guessSize('réviser la philo')).toBe(3);
    expect(guessSize('préparer mon examen')).toBe(3);
    expect(guessSize('la lessive')).toBe(2);
    expect(guessSize('le ménage')).toBe(2);
    expect(guessSize('appeler la banque')).toBe(1);
    expect(guessSize('mail to the landlord')).toBe(1);
  });
});

describe('guessSize: real examples', () => {
  const cases: [string, number][] = [
    // big words and big numbers push toward Big
    ['make a 100 report', 3],
    ['Make a 100 page report', 3],
    ['write my essay', 3],
    ['finish the client proposal presentation', 3],
    ['study for the midterm', 3],
    ['clean the house', 3],
    ['clean my whole apartment', 3],
    ['read 50 pages', 3],
    ['write the client proposal', 3],
    ['do 20 exercises', 3],
    ['work on the thesis', 3],
    ['make 60 flashcards', 3],
    // quick verbs stay small, even with numbers that are money or time
    ['text mom', 1],
    ['call the dentist', 1],
    ['reply to Sara', 1],
    ['send the invoice', 0],
    ['pay rent', 0],
    ['pay 100 dh to Karim', 0],
    ['call grandma at 5 pm', 1],
    ['email my prof about the 3000 word essay', 1],
    ['reply to 30 emails', 2],
    ['write a grocery list', 1],
    ['buy toilet paper', 1],
    ['buy 2 kg of tomatoes', 1],
    ['laundry', 2],
  ];
  it.each(cases)('%s → %i', (text, size) => expect(guessSize(text)).toBe(size));

  const fr: [string, number][] = [
    ['faire le rapport de stage', 3],
    ['rédiger la dissertation', 3],
    ['réviser le bac de philo', 3],
    ['lire 40 pages du livre', 3],
    ['faire le grand ménage', 3],
    ['nettoyer toute la maison', 3],
    ['préparer l’exposé', 3],
    ['faire les courses', 2],
    ['appeler maman', 1],
    ['répondre à Yassine', 1],
    ['envoyer le dossier', 1],
    ['payer le loyer', 0],
    ['payer 200 dirhams', 0],
    ['écrire une carte à mamie', 1],
  ];
  it.each(fr)('FR %s → %i', (text, size) => expect(guessSize(text)).toBe(size));
});
