import { biteGroup, biteIcon } from './bite-icon';
import type { IconName } from '@/components/icon';

describe('biteIcon', () => {
  it('reads what the bite is about', () => {
    expect(biteIcon('Email my prof about the essay', 1)).toBe('mail');
    expect(biteIcon('Call grandma back', 1)).toBe('phone');
    expect(biteIcon('Text Mom back', 0)).toBe('message');
    expect(biteIcon('Do laundry', 2)).toBe('laundry');
    expect(biteIcon('Clean my room', 3)).toBe('clean');
    expect(biteIcon('Finish the essay', 3)).toBe('write');
    expect(biteIcon('Pay the phone bill', 1)).toBe('pay');
    expect(biteIcon('Pay rent', 1)).toBe('pay');
    expect(biteIcon('Drink water', 0)).toBe('drop');
    expect(biteIcon('Buy oat milk', 1)).toBe('shop');
    expect(biteIcon('Gym', 2)).toBe('gym');
    expect(biteIcon('Walk the dog', 1)).toBe('walk');
  });
  it('understands word endings', () => {
    expect(biteIcon('Answer emails', 1)).toBe('mail');
    expect(biteIcon('Send email to prof', 1)).toBe('mail');
    expect(biteIcon('Calling the landlord', 1)).toBe('phone');
    expect(biteIcon('Texting Sara', 0)).toBe('message');
    expect(biteIcon('Cleaning the kitchen', 2)).toBe('clean');
    expect(biteIcon('Studying for the exam', 3)).toBe('study');
    expect(biteIcon('Paid the bills', 1)).toBe('pay');
  });
  it('understands French', () => {
    expect(biteIcon('Envoyer un mail au prof', 1)).toBe('mail');
    expect(biteIcon('Appeler maman', 1)).toBe('phone');
    expect(biteIcon('Faire la lessive', 2)).toBe('laundry');
    expect(biteIcon('Ranger ma chambre', 2)).toBe('clean');
    expect(biteIcon('Réviser le partiel', 3)).toBe('study');
    expect(biteIcon('Payer le loyer', 1)).toBe('pay');
    expect(biteIcon('Faire les courses', 2)).toBe('shop');
    expect(biteIcon('Prendre rdv chez le médecin', 1)).toBe('doctor');
  });
  it('does not match inside other words', () => {
    expect(biteIcon('Restaurant booking', 1)).not.toBe('bed');
    expect(biteIcon('Scary movie night', 1)).not.toBe('car');
  });
  it('falls back to the size food icon', () => {
    expect(biteIcon('JJ', 0)).toBe('foodTiny');
    expect(biteIcon('something vague', 3)).toBe('foodBig');
  });
});

describe('biteIcon: Spanish', () => {
  it('knows common Spanish tasks', () => {
    expect(biteIcon('llamar a la abuela', 1)).toBe('phone');
    expect(biteIcon('comprar leche', 1)).toBe('shop');
    expect(biteIcon('estudiar para el examen', 3)).toBe('study');
    expect(biteIcon('pagar el alquiler', 0)).toBe('pay');
  });
});

const CASES: [string, IconName][] = [
  // action beats topic
  ['call mum about rent', 'phone'],
  ['email the landlord about the bill', 'mail'],
  ['text Sara happy birthday', 'message'],
  ['Reply to the email from HR', 'mail'],
  ['Pay the phone bill', 'pay'],
  ['Call the bank about the transfer', 'phone'],
  ['Phone the dentist', 'phone'],
  ['Send an email to Sara about the gift', 'mail'],
  ['Make a 100 report', 'work'],
  ['Email prof', 'mail'],
  // typos and short forms
  ['reply to emial', 'mail'],
  ['do excercise', 'gym'],
  ['dentist appt tomorrow', 'doctor'],
  ['finish hw', 'study'],
  ['msg Sara', 'message'],
  ['see dr Hamid', 'doctor'],
  ['groc run', 'shop'],
  ['do laundy', 'laundry'],
  // false hits
  ['eat an apple', 'cook'],
  ['dentist appointment', 'doctor'],
  ['fix the app', 'code'],
  ['run the report', 'work'],
  ['run the tests', 'code'],
  ['run 5k', 'gym'],
  ['go for a run', 'gym'],
  ['run errands', 'shop'],
  ['classify the data', 'foodBig'],
  ['go to class', 'study'],
  ['chat with Sara', 'message'],
  ['feed the chat', 'pet'],
  ['nourrir le chat', 'pet'],
  ['brush the cat', 'pet'],
  ['design the landing page', 'code'],
  ['read page 40', 'book'],
  ['water the plants', 'plant'],
  ['drink water', 'drop'],
  ['Rent a car', 'car'],
  ['online courses', 'study'],
  // school subjects
  ['math homework', 'math'],
  ['revise chemistry', 'science'],
  ['physics lab report', 'science'],
  ['learn French vocab', 'language'],
  ['Spanish grammar', 'language'],
  ['write the history essay', 'write'],
  ['read chapter 3', 'book'],
  ['study for the exam', 'study'],
  // creative
  ['draw a comic', 'paint'],
  ['paint the poster', 'paint'],
  ['practice guitar', 'music'],
  ['practice my instrument', 'music'],
  ['edit the video', 'video'],
  ['watch a movie', 'video'],
  ['photo shoot', 'camera'],
  ['take photos of the room', 'camera'],
  ['record the podcast', 'record'],
  // people
  ['visit grandma', 'people'],
  ['dinner with friends', 'people'],
  ['plan Sara birthday party', 'cake'],
  ['buy a gift for dad', 'gift'],
  ['date night', 'heart'],
  ['go on a date', 'heart'],
  ['help my brother', 'people'],
  // home fixes
  ['fix the tap', 'fix'],
  ['change the light bulb', 'bulb'],
  ['repair the chair', 'fix'],
  ['assemble the IKEA shelf', 'fix'],
  ['fix the bug', 'code'],
  // plants, sleep
  ['water the flowers', 'plant'],
  ['mow the lawn', 'plant'],
  ['take a nap', 'bed'],
  ['make the bed', 'bed'],
  ['sleep by 11', 'bed'],
  // self care
  ['get a haircut', 'cut'],
  ['do my nails', 'cut'],
  ['put on makeup', 'beauty'],
  ['brush my teeth', 'shower'],
  ['wash my hair', 'shower'],
  ['take a shower', 'shower'],
  // prayer, meditation
  ['pray fajr', 'pray'],
  ['meditate 5 min', 'pray'],
  ['go to the mosque', 'pray'],
  ['read quran', 'pray'],
  ['church on sunday', 'pray'],
  // papers and admin
  ['fill the form', 'doc'],
  ['sign the contract', 'doc'],
  ['print the ticket', 'print'],
  ['scan the documents', 'scan'],
  ['renew my passport', 'idcard'],
  ['renew ID card', 'idcard'],
  ['pay the subscription', 'pay'],
  // gaming
  ['play fortnite', 'game'],
  ['gaming night', 'game'],
  // kids
  ['school run', 'baby'],
  ['pick up the kids', 'baby'],
  ['feed the baby', 'baby'],
  // trash, recycling
  ['take out the trash', 'trash'],
  ['recycling', 'recycle'],
  ['put out the bins', 'trash'],
  // phone care, mail, parcels
  ['charge my phone', 'smartphone'],
  ['update my phone', 'smartphone'],
  ['pick up the parcel', 'parcel'],
  ['go to the post office', 'parcel'],
  ['mail the package', 'parcel'],
  ['track my delivery', 'parcel'],
  ['check the mail', 'mail'],
  // money, work, misc existing
  ['budget for the month', 'money'],
  ['file taxes', 'money'],
  ['budget meeting', 'work'],
  ['update my CV', 'work'],
  ['install updates', 'laptop'],
  ['book a flight', 'travel'],
  ['book a table', 'calendar'],
  ['book a doctor appointment', 'doctor'],
  ['wash the car', 'car'],
  ['take the dog to the vet', 'pet'],
  ['make a to-do list', 'list'],
  ['walk the dog', 'walk'],
  ['pick up dry cleaning', 'shop'],
  ['buy oat milk', 'shop'],
  ['go home', 'home'],
  // French
  ['envoyer un mail à la prof', 'mail'],
  ['appeler maman pour le loyer', 'phone'],
  ['envoyer un message à Sara', 'message'],
  ['payer la facture', 'pay'],
  ['faire la lessive', 'laundry'],
  ['faire la vaisselle', 'clean'],
  ['faire le ménage', 'clean'],
  ['préparer le dîner', 'cook'],
  ['aller à la salle', 'gym'],
  ['promenade dans le parc', 'walk'],
  ['arroser les plantes', 'plant'],
  ['acheter du pain', 'shop'],
  ['faire les courses', 'shop'],
  ['rdv chez le dentiste', 'doctor'],
  ['réviser les maths', 'math'],
  ['devoirs de physique', 'science'],
  ['cours de français', 'language'],
  ['dessiner un portrait', 'paint'],
  ['jouer de la guitare', 'music'],
  ['monter la vidéo', 'video'],
  ['jouer à la console', 'game'],
  ['aller à la mosquée', 'pray'],
  ['sortir la poubelle', 'trash'],
  ['imprimer le formulaire', 'print'],
  ['renouveler la carte d\'identité', 'idcard'],
  ['acheter un cadeau pour papa', 'gift'],
  ['anniversaire de ma soeur', 'cake'],
  ['récupérer les enfants à l\'école', 'baby'],
  ['faire la sieste', 'bed'],
  ['aller chez le coiffeur', 'cut'],
  ['changer l\'ampoule', 'bulb'],
  ['mettre à jour mon téléphone', 'smartphone'],
  ['récupérer le colis', 'parcel'],
  // Spanish
  ['llamar a mamá', 'phone'],
  ['enviar un correo al profe', 'mail'],
  ['mandar un mensaje a Ana', 'message'],
  ['pagar la factura', 'pay'],
  ['lavar los platos', 'clean'],
  ['limpiar la casa', 'clean'],
  ['estudiar matemáticas', 'math'],
  ['hacer la tarea', 'study'],
  ['comprar leche', 'shop'],
  ['cita con el médico', 'doctor'],
  ['cocinar la cena', 'cook'],
  ['tocar el piano', 'music'],
  ['pasear al perro', 'walk'],
  ['regar las plantas', 'plant'],
  ['cumpleaños de Ana', 'cake'],
  ['sacar la basura', 'trash'],
  ['reservar el hotel', 'travel'],
  // Darija (Latin letters and digits)
  ['n9ra l3chiya', 'study'],
  ['9ra l imti7an', 'study'],
  ['n9ra ktab', 'book'],
  ['khdma dyal lyoum', 'work'],
  ['nsift email l prof', 'mail'],
  ['nsift lkhedma', 'work'],
  ['n3yet l mama', 'phone'],
  ['nghsel l7wayej', 'laundry'],
  ['ntyeb ghda', 'cook'],
  ['nechri l7lib', 'shop'],
  ['nsali lfajr', 'pray'],
  ['n3es chwiya', 'bed'],
  ['nkhelles lkra', 'pay'],
  ['njme3 lbit', 'clean'],
  ['sir l sbitar', 'doctor'],
  ['tbib lyoum', 'doctor'],
  ['mdrasa dyal drari', 'baby'],
  ['sir l jam3a', 'study'],
  ['rje3 l dar', 'home'],
  ['nsle7 lbab', 'fix'],
];

describe('biteIcon: many real-looking bites', () => {
  it.each(CASES)('%s -> %s', (title, icon) => {
    expect(biteIcon(title, 3)).toBe(icon);
  });
});

const GROUPS: [string, ReturnType<typeof biteGroup>][] = [
  ['Gym', 'body'],
  ['take a nap', 'body'],
  ['dentist appt', 'body'],
  ['brush my teeth', 'body'],
  ['walk the dog', 'body'],
  ['clean my room', 'home'],
  ['do laundry', 'home'],
  ['take out the trash', 'home'],
  ['fix the tap', 'home'],
  ['feed the cat', 'home'],
  ['email my boss', 'work'],
  ['finish the report', 'work'],
  ['fix the bug', 'work'],
  ['slides for monday', 'work'],
  ['khdma dyal lyoum', 'work'],
  ['call mum', 'people'],
  ['text Sara', 'people'],
  ['buy a gift for dad', 'people'],
  ['school run', 'people'],
  ['visit grandma', 'people'],
  ['study for the exam', 'mind'],
  ['read chapter 3', 'mind'],
  ['meditate 5 min', 'mind'],
  ['math homework', 'mind'],
  ['n9ra l imti7an', 'mind'],
  ['pay rent', 'money'],
  ['call mum about rent', 'people'],
  ['pay the phone bill', 'money'],
  ['do my taxes', 'money'],
  ['budget for the month', 'money'],
  ['practice guitar', 'fun'],
  ['play fortnite', 'fun'],
  ['book a flight', 'fun'],
  ['edit the video', 'fun'],
  ['paint the poster', 'fun'],
  ['réviser les maths', 'mind'],
  ['llamar a mamá', 'people'],
  ['nechri l7lib', 'home'],
  ['something vague', null],
  ['JJ', null],
];

describe('biteGroup', () => {
  it.each(GROUPS)('%s -> %s', (title, group) => {
    expect(biteGroup(title)).toBe(group);
  });
});
