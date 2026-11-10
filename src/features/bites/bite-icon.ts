import type { IconName } from '@/components/icon';
import type { Size } from '@/state/schema';

/**
 * Pick an icon from what the bite is about (Anass: one carrot everywhere looked lazy; then
 * "smart: an email task shows an email icon"). Plain rules, no AI (DECISIONS: editable rules in
 * the core loop).
 *
 * Two passes:
 *  1. ACTION verbs (email, call, text, pay): the earliest one in the title wins, because the thing
 *     you DO beats the thing it is about ("call mum about rent" -> phone, "email the landlord
 *     about the bill" -> mail).
 *  2. TOPIC rules, in order, first match wins (specific before general).
 * No match -> the size's food icon.
 *
 * Words match their usual endings (emails, calling, texted). The title is lower-cased and
 * accent-stripped first, so rules are written without accents (rédiger -> rediger). Word edges
 * are Unicode-aware and digits count as letters (Moroccan Darija in Latin letters: 9ra, 3yet).
 * Languages: English, French, Spanish, a basic Darija. Each rule carries a group for a later
 * colour dot (see biteGroup).
 */
export type BiteGroup = 'body' | 'home' | 'work' | 'people' | 'mind' | 'money' | 'fun';

type Rule = { icon: IconName; group: BiteGroup; test: (t: string) => number };

const ENDINGS = '(?:s|es|ed|d|ing|er|ers)?';
const EDGE_L = '(?:^|[^\\p{L}\\p{N}])';
const EDGE_R = '(?=$|[^\\p{L}\\p{N}])';

/** `not` is a regex fragment: the rule is skipped when the match is followed by it. */
const rule = (icon: IconName, group: BiteGroup, words: string[], not?: string): Rule => {
  const re = new RegExp(`${EDGE_L}(?:${words.join('|')})${ENDINGS}${EDGE_R}${not ? `(?!${not})` : ''}`, 'iu');
  return { icon, group, test: (t) => re.exec(t)?.index ?? -1 };
};

/** Lower-case, strip accents, turn apostrophes into spaces (l'imti7an -> l imti7an). */
const normalize = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/[’'`]/g, ' ');

// ---- pass 1: action verbs (earliest in the title wins) --------------------------------------
const ACTIONS: Rule[] = [
  rule('mail', 'work', ['e-?mail', 'emial', 'emal', 'imel', 'inbox', 'newsletter', 'gmail', 'outlook', 'courriel', 'correo', 'mail(?!\\s+(?:the |a |my |this |that )?(?:package|parcel|letter|card|form|forms|cheque|check)\\b)']),
  rule('phone', 'people', [
    'call', 'ring', 'voicemail', 'facetime', 'dial', 'appel', 'appeler', 'appelle', 'rappeler', 'rappelle', 'telephoner', 'llamar', 'llama', 'llamada', 'llamo',
    '3yet', 'n3yet', 't3yet', '3ayet', 'n3ayet', 'tilifon',
    'phone(?= (?:the|up|back|him|her|them|my (?:mum|mom|dad|mother|father|sister|brother|friend|landlord|doctor|dentist|boss|bank)))',
  ]),
  rule('message', 'people', ['text', 'texto', 'texter', 'sms', 'msg', 'msgs', 'message', 'mensaje', 'dm', 'whats ?app', 'telegram', 'snap', 'insta', 'instagram', 'messenger', 'imessage', 'whatsap']),
  rule('pay', 'money', ['pay', 'paid', 'payer', 'paie', 'paye', 'pagar', 'pago', 'khelles', 'nkhelles', 'n?khlass', 'n?5elles', 'khlas']),
];

// chat: the French word for cat, or a message. A pet word near it means the animal.
const PET_NEAR = /(?:^|[^\p{L}\p{N}])(?:feed|groom|litter|vet|veto|veterinaire|vaccin\w*|croquettes?|nourrir|nourris|brosser|caresser|gamelle|kibble|adopt\w*|cage)(?=$|[^\p{L}\p{N}])/iu;
const PET_STRONG = rule('pet', 'home', [
  'dog', 'cat', 'pet', 'vet', 'puppy', 'kitten', 'fish', 'hamster', 'rabbit', 'chien', 'chiot', 'chaton', 'perro', 'gato', 'mascota', 'veterinario', 'veto', 'veterinaire', 'kelb', 'klab', '9ett', 'qett', 'litter', 'kibble', 'croquettes?',
]);
const CHAT = rule('pet', 'home', ['chat']);
const PET: Rule = {
  icon: 'pet',
  group: 'home',
  test: (t) => {
    const a = PET_STRONG.test(t);
    if (a >= 0) return a;
    return PET_NEAR.test(t) ? CHAT.test(t) : -1;
  },
};

const NOT_RUN = '\\s+(?:late|out|low|errands?|(?:the |a |my |all |some )?(?:report|reports|script|scripts|tests?|numbers|query|queries|code|build|migration|meeting|backup|payroll|analysis|checks?|diagnostics?|program|experiments?|campaign|ads?)\\b)';

// ---- pass 2: topics, first match wins --------------------------------------------------------
const TOPICS: Rule[] = [
  rule('gift', 'people', ['gift', 'cadeau', 'regalo', 'kado', 'hdiya', 'hadiya', 'present for']),
  rule('cake', 'people', ['birthday', 'bday', 'b-day', 'anniversaire', 'cumpleanos', 'aid milad', '3id milad', '3id l?milad']),
  rule('confetti', 'people', ['party', 'fiesta', 'fete', 'soiree', 'celebrate', 'celebration', 'wedding', 'mariage', 'boda', '3ors', '3erss']),
  rule('pay', 'money', ['bill', 'rent', 'invoice', 'subscription', 'refund', 'facture', 'loyer', 'abonnement', 'rembourse', 'factura', 'alquiler', 'fatoura', 'kra', 'lkra'], '\\s+(?:a|an)\\s'),
  rule('shop', 'home', ['errands?', 'groc(?:ery|eries)? run', 'dry cleaning', 'dry cleaner']),
  rule('science', 'mind', ['lab reports?']),
  rule('baby', 'people', ['baby', 'babies', 'kid', 'kids', 'child', 'children', 'school run', 'daycare', 'nursery', 'diapers?', 'nappies', 'bebe', 'enfants?', 'creche', 'nino', 'ninos', 'guarderia', 'hijos?', 'drari', 'wldi', 'drop (?:off )?the kids']),
  rule('parcel', 'home', ['package', 'parcel', 'post office', 'delivery', 'deliveries', 'colis', 'livraison', 'paquete', 'envio', 'correos', 'courrier', 'poste', 'barid', 'dhl', 'fedex', 'mail (?:the |a |my )?(?:package|parcel|letter|card)', 'return (?:the |my |that |these )?(?:item|order|package|parcel|shoes|dress|jacket|clothes)']),
  rule('smartphone', 'work', [
    '(?:charge|update|backup|restart|clean|unlock|reset)(?: my| the| your)? (?:phone|iphone|android|mobile|smartphone|portable)',
    'phone (?:update|battery|charger|storage|case|screen|backup|settings)', 'iphone', 'smartphone', 'chargeur',
    'cargar (?:el |mi )?(?:movil|celular|telefono)', 'charger (?:mon )?(?:telephone|tel|portable)', 'mettre a jour (?:mon |le )?(?:telephone|portable)',
  ]),
  rule('print', 'work', ['print', 'printer', 'imprimer', 'imprimir', 'tba3', 'tbe3']),
  rule('scan', 'work', ['scan', 'scanner', 'escanear', 'numeriser', 'photocopy', 'photocopie', 'fotocopia']),
  rule('idcard', 'work', ['id', 'cin', 'cnie', 'id card', 'bitaka', 'dni', 'carte d identite', 'carte grise', 'licen[sc]e', 'permis', 'renew (?:my |the )?(?:passport|visa|card|permit|insurance)', 'renouveler', 'renovar']),
  rule('doc', 'work', ['forms?', 'documents?', 'paperwork', 'paperasse', 'sign', 'signature', 'contract', 'formulaire', 'dossier', 'papiers', 'formulario', 'contrato', 'firmar', 'firma', 'documento', 'wra9', 'wra9i', 'tawqi3', '3a9d']),
  rule('bulb', 'home', ['bulb', 'light ?bulb', 'lamp', 'ampoule', 'lampe', 'bombilla']),
  rule('bulb', 'mind', ['idea', 'ideas', 'brainstorm', 'idee', 'idees']),
  rule('pray', 'mind', [
    'pray', 'prayer', 'meditat(?:e|ion|ing)', 'mindful(?:ness)?', 'mosque', 'mosquee', 'masjid', 'church', 'eglise', 'iglesia', 'misa', 'quran', 'coran', 'koran', 'dua', 'du3a', 'dhikr', 'rosary', 'fajr', 'dhuhr', 'zuhr', 'asr', 'maghrib', 'isha',
    'prier', 'priere', 'meditation', 'meditar', 'rezar', 'oracion', 'orar', 'sla', 'sala', 'salat', 'salah', 'nsali', 'n?sali', 'jami3', 'jam3',
  ]),
  rule('health', 'body', ['pills?', 'meds?', 'medicine', 'vitamins?', 'supplements?', 'insulin', 'inhaler', 'pharmacy', 'prescription', 'medicaments?', 'pharmacie', 'ordonnance', 'farmacia', 'medicamentos?', 'doliprane', 'dawa', 'dwa', 'tablets?', 'aspirin', 'ibuprofen']),
  rule('shower', 'body', ['shower', 'bath', 'brush (?:my )?teeth', 'floss', 'skincare', 'shave', 'wash (?:my )?(?:hair|face)', 'douche', 'bain', 'dents', 'ducha', 'bano', 'cepillar', 'hammam', '7mam']),
  rule('beauty', 'body', ['makeup', 'make-up', 'maquillage', 'maquillar', 'lipstick', 'mascara', 'perfume', 'parfum']),
  rule('cut', 'body', ['haircut', 'hair', 'barber', 'nails?', 'manicure', 'pedicure', 'coiffeur', 'coiffure', 'ongles', 'peluqueria', 'pelo', 'unas', '7laq', 'hlaq', 'salon']),
  rule('doctor', 'body', ['doctor', 'dr', 'dentist', 'therapy', 'therapist', 'appointment', 'appt', 'clinic', 'hospital', 'check-?up', 'physio', 'optician', 'blood test', 'vaccin\\w*', 'medecin', 'docteur', 'dentiste', 'rendez-vous', 'rdv', 'psy', 'medico', 'doctora', 'cita', 'clinique', 'urgences', 'tbib', 'tbiba', 'sbitar', 'spitar', 'mustashfa', 'analyses', 'dispensaire']),
  rule('travel', 'fun', ['flight', 'flights', 'trip', 'travel', 'pack', 'packing', 'suitcase', 'visa', 'passport', 'airport', 'hotel', 'airbnb', 'ticket', 'tickets', 'luggage', 'vacation', 'holiday', 'train (?:ticket|station)', 'vol', 'voyage', 'valise', 'billet', 'passeport', 'vacances', 'aeropuerto', 'viaje', 'maleta', 'vuelo', 'pasaporte', 'safar', 'sfar', '3otla']),
  rule('code', 'work', ['code', 'coding', 'bug', 'deploy', 'commit', 'github', 'app', 'website', 'site', 'landing page', 'web ?page', 'home ?page', 'pull request', 'api', 'database', 'frontend', 'backend', 'javascript', 'python', 'typescript', 'react', 'css', 'html', 'sql', 'script', 'unit tests?', 'test suite', 'run (?:the |all )?tests?', 'debug', 'refactor', 'programm\\w*', 'dev', 'sitio web', 'pagina web', 'codigo', 'programar']),
  rule('slides', 'work', ['slides', 'presentation', 'deck', 'pitch', 'diapo', 'powerpoint', 'keynote', 'ppt', 'pptx', 'presentacion']),
  rule('work', 'work', ['work', 'meeting', 'boss', 'clients?', 'project', 'report', 'job', 'apply', 'application', 'cv', 'resume', 'linkedin', 'interview', 'office', 'colleague', 'manager', 'standup', 'travail', 'reunion', 'projet', 'rapport', 'stage', 'entretien', 'bureau', 'collegue', 'trabajo', 'proyecto', 'informe', 'empleo', 'entrevista', 'oficina', 'l?khdma', 'l?khedma', '5edma', 'khdem', 'nkhdem', 'n5dem', '5dem', 'shghl', 'chghl', 'idara']),
  rule('calendar', 'work', ['calendar', 'schedule', 'plan', 'planning', 'book(?: a| an| the| my| me)', 'booking', 'reserve', 'reservation', 'deadline', 'agenda', 'reserver', 'planifier', 'calendrier', 'reservar', 'calendario', 'horario', '7jez', 'n7jez']),
  rule('fix', 'home', ['fix', 'repair', 'assemble', 'ikea', 'tools?', 'screw', 'drill', 'plumb(?:er|ing)', 'leak', 'broken', 'reparer', 'bricolage', 'monter (?:un |le |les |la )?(?:meuble|etagere|lit|bureau|armoire)', 'arreglar', 'reparar', 'herramienta', 'plombier', 'fontanero', 'sle7', 'nsle7', 'sla7']),
  rule('bed', 'body', ['sleep', 'nap', 'bed', 'bedtime', 'relax', 'chill', 'repos', 'reposer', 'dormir', 'sieste', 'lit', 'coucher', 'siesta', 'descansar', 'acostarme', 'cama', 'n3es', 'n3as', 'ns3es', 'nnam', 'nam', 'rqad', 'nrqed', 'rgad', 'nrgd']),
  rule('recycle', 'home', ['recycl\\w*']),
  rule('trash', 'home', ['trash', 'garbage', 'rubbish', 'bin', 'bins', 'poubelle', 'ordures', 'basura', 'zbel', 'zbal', 'dechets']),
  rule('laundry', 'home', ['laundry', 'laundy', 'laundary', 'lundry', 'wash (?:my )?clothes', 'washing machine', 'fold', 'iron', 'ironing', 'lessive', 'linge', 'repasser', 'ropa', 'lavar (?:la )?ropa', 'colada', 'planchar', 'ghsel (?:l)?(?:7wayj|hwayj|7wayej|lbsa|tbsil)']),
  rule('camera', 'fun', ['photos?', 'pictures?', 'selfie', 'camera', 'photograph\\w*', 'photoshoot', 'fotos?', 'photographier', 'swar', 'tswir']),
  rule('clean', 'home', [
    'dish', 'dishes', 'clean', 'tidy', 'vacuum', 'mop', 'dust', 'declutter', 'organi[sz]e', 'room', 'desk', 'sweep', 'wipe', 'scrub', 'bathroom', 'kitchen', 'toilet', 'bedroom', 'apartment', 'flat', 'house', 'chores?', 'housework',
    'menage', 'nettoyer', 'ranger', 'rangement', 'vaisselle', 'aspirateur', 'chambre', 'limpiar', 'ordenar', 'platos', 'lavar (?:los )?platos', 'barrer', 'fregar', 'habitacion', 'cuarto',
    'jme3', 'njme3', 'nqi', 'nqqi', 'rtb', 'rattab', 'nrtb', 'nrattab',
  ]),
  rule('people', 'people', ['(?:with|avec|con|m3a) (?:my |mes |mi |mis )?(?:friends?|family|mum|mom|dad|mother|father|parents|cousins?|amis?|amies|famille|amigos?|amigas?|familia|sa7bi|sahbi|khoya|khti)']),
  rule('cook', 'home', ['cook', 'cooking', 'dinner', 'lunch', 'breakfast', 'meal ?prep', 'bake', 'recipe', 'eat', 'cuisiner', 'cuisine', 'repas', 'diner', 'dejeuner', 'petit[- ]dej', 'manger', 'cocinar', 'cena', 'comida', 'almuerzo', 'desayuno', 'comer', 'tyeb', 'ntyeb', 'tiyeb', 'ntiyeb', 'tbakh', 'ftour', 'ftor', 'ghda', 'ghada', '3cha', '3asha', 'makla']),
  rule('walk', 'body', ['walk', 'stroll', 'step outside', 'go outside', 'fresh air', 'hike', 'marcher', 'promenade', 'balade', 'caminar', 'pasear', 'tmcha', 'tmasha', 'ntmcha']),
  rule('gym', 'body', ['run', 'running'], NOT_RUN),
  rule('gym', 'body', ['gym', 'workout', 'work out', 'jog', 'yoga', 'stretch', 'push-?ups?', 'exercise', 'excercise', 'exercize', 'exersize', 'training', 'train', 'sport', 'salle', 'courir', 'footing', 'muscu', 'musculation', 'entrainement', 'ejercicio', 'correr', 'gimnasio', 'pilates', 'cardio', 'swim', 'swimming', 'natation', 'nadar', 'cycling', 'bike', 'squats?', 'weights', 'tmarin', 'tmrin', 'riyada']),
  rule('plant', 'home', ['plants?', 'garden', 'flowers?', 'plantes?', 'jardin', 'fleurs?', 'plantas?', 'flores', 'regar', 'arroser', 'weed', 'lawn', 'pelouse', 'jnan', 'jenan', 'nbat', 'nbatat', 'water (?:the |my |our |all )?(?:plants?|flowers?|garden|lawn|herbs|tree|trees)']),
  rule('drop', 'body', ['water', 'drink', 'hydrate', 'hydrat\\w*', 'boire', 'eau', 'agua', 'beber']),
  rule('shop', 'home', [
    'groceries', 'grocery', 'groc', 'grocs', 'buy', 'bought', 'shop', 'shopping', 'order', 'amazon', 'pick up', 'acheter', 'achat', 'commander', 'comprar', 'compras', 'supermarket', 'market', 'marche', 'mall', 'store', 'mercado', 'supermercado',
    '(?<!online )(?<!udemy )courses', 'chri', 'nechri', 'nchri', 'techri', 'tsawek', 'tsouk', 'hanout', 'souk', 'marjane', 'carrefour',
  ]),
  rule('money', 'money', ['bank', 'budget', 'tax', 'taxes', 'money', 'saving', 'savings', 'transfer', 'invest', 'crypto', 'salary', 'loan', 'credit', 'debt', 'banque', 'impots?', 'argent', 'virement', 'banco', 'dinero', 'impuestos', 'ahorro', 'flous', 'flouss', 'salaire']),
  rule('write', 'mind', ['essay', 'dissertation', 'thesis', 'redaction', 'rediger', 'ensayo', 'tesis', 'insha']),
  rule('math', 'mind', ['math', 'maths', 'mathematics', 'algebra', 'calculus', 'geometry', 'statistics', 'stats', 'arithmetic', 'equations?', 'mathematiques', 'mates', 'matematicas', 'riyadiyat', 'ryadiyat']),
  rule('science', 'mind', ['science', 'sciences', 'physics', 'chemistry', 'biology', 'lab report', 'physique', 'chimie', 'biologie', 'svt', 'fisica', 'quimica', 'biologia', 'ciencias', 'fiziya', 'kimya']),
  rule('language', 'mind', ['english', 'french', 'spanish', 'arabic', 'german', 'language', 'vocab', 'vocabulary', 'grammar', 'duolingo', 'francais', 'anglais', 'espagnol', 'arabe', 'allemand', 'langue', 'vocabulaire', 'grammaire', 'ingles', 'frances', 'espanol', 'idioma', 'gramatica', 'logha', 'fransiya', 'inglizia']),
  rule('write', 'mind', ['write', 'writing', 'wrote', 'draft', 'journal', 'notes?', 'letter', 'blog', 'ecrire', 'lettre', 'escribir', 'carta', 'ktb', 'nktb']),
  rule('book', 'mind', ['ktab', 'kitab', 'kutub']),
  rule('study', 'mind', [
    'study', 'studies', 'studying', 'exam', 'homework', 'hw', 'hws', 'assignments?', 'class', 'classes', 'lecture', 'revise', 'revision', 'quiz', 'flashcards?', 'anki', 'memori[sz]e', 'learn', 'learning', 'school', 'university', 'college', 'uni', 'campus', 'course', 'courses',
    'reviser', 'examen', 'devoirs?', 'cours', 'partiel', 'ecole', 'lycee', 'fac', 'universite', 'estudiar', 'tarea', 'deberes', 'colegio', 'escuela', 'universidad', 'clase',
    '9ra', 'n9ra', '9rit', 'imti7an', 'imtihan', 'dars', 'doros', 'mraja3a', 'mouraja3a', 'mdrasa', 'madrasa', 'medrsa', 'jam3a', 'jami3a',
  ]),
  rule('book', 'mind', ['read', 'reading', 'book', 'chapter', 'article', 'page', 'novel', 'kindle', 'lire', 'livre', 'chapitre', 'leer', 'libro']),
  rule('laptop', 'work', ['laptop', 'computer', 'update', 'updates', 'backup', 'install', 'download', 'google drive', 'dropbox', 'icloud', 'onedrive', 'ordi', 'ordinateur', 'pc', 'mac', 'macbook', 'software', 'wifi', 'passwords?', 'ordenador', 'computadora', 'portatil', 'instalar', 'actualizar', 'descargar', 'telecharger', 'mise a jour', 'kompiter']),
  rule('car', 'home', ['car', 'drive', 'driving', 'gas', 'fuel', 'parking', 'mechanic', 'taxi', 'uber', 'oil change', 'tires?', 'tyres?', 'car ?wash', 'voiture', 'essence', 'garage', 'vidange', 'lavage', 'coche', 'auto', 'gasolina', 'conducir', 'taller', 'tomobil', 'tonobil', 'siyara']),
  rule('laundry', 'home', ['ghsel', 'nghsel', 'ghsl']),
  PET,
  rule('message', 'people', ['reply', 'respond', 'chat', 'repondre', 'reponds', 'responder', 'sift', 'nsift', 'sayft']),
  rule('heart', 'people', ['a date', 'date night', 'date with', 'first date', 'on a date', 'dating', 'girlfriend', 'boyfriend', 'partner', 'wife', 'husband', 'fiance', 'valentine', 'novia', 'novio', 'copine', 'copain', 'cherie']),
  rule('people', 'people', [
    'mom', 'dad', 'mum', 'mother', 'father', 'parents', 'grandma', 'grandpa', 'granny', 'family', 'friend', 'friends', 'sister', 'brother', 'cousin', 'aunt', 'uncle', 'neighbou?r', 'roommate', 'sibling', 'visit', 'catch up', 'hang ?out',
    'maman', 'papa', 'mere', 'pere', 'famille', 'amis?', 'amies?', 'soeur', 'frere', 'tante', 'oncle', 'voisin', 'mama', 'baba', 'abuela', 'abuelo', 'hermana', 'hermano', 'amigos?', 'amigas?', 'primo', 'tio', 'tia', 'familia',
    'khoya', 'khti', 'sa7bi', 'sahbi', 'jdi', 'jdda', '3mmi', 'khali', 'khalti', '3ayla',
  ]),
  rule('video', 'fun', ['videos?', 'film', 'movie', 'movies', 'youtube', 'tiktok', 'reels?', 'capcut', 'montage', 'pelicula', 'watch', 'netflix', 'series', 'episode', 'anime']),
  rule('paint', 'fun', ['paint', 'draw', 'drawing', 'sketch', 'art', 'design', 'illustrat\\w*', 'doodle', 'canvas', 'logo', 'figma', 'poster', 'graphic', 'peindre', 'dessiner', 'dessin', 'peinture', 'dibujar', 'dibujo', 'pintar', 'diseno', 'rsm', 'rsem', 'nrsem']),
  rule('music', 'fun', ['music', 'practice (?:my )?(?:instrument|scales|chords)', 'guitar', 'piano', 'song', 'playlist', 'sing', 'singing', 'instrument', 'ukulele', 'drums?', 'violin', 'oud', 'ghita', 'lyrics', 'chanter', 'musique', 'guitare', 'chanson', 'tocar', 'cancion', 'musica', 'ghna', 'nghni', 'mousiqa', 'n3zef']),
  rule('record', 'fun', ['record', 'podcast', 'voice ?note', 'vocal', 'enregistrer']),
  rule('game', 'fun', ['game', 'games', 'gaming', 'gamer', 'play', 'playing', 'ps5', 'ps4', 'playstation', 'xbox', 'nintendo', 'steam', 'fortnite', 'minecraft', 'roblox', 'valorant', 'fifa', 'chess', 'puzzle', 'jeu', 'jeux', 'jouer', 'juego', 'jugar', 'l3ab', 'n3ab']),
  rule('home', 'home', ['go home', 'get home', 'come home', 'head home', 'back home', 'dar', 'rentrer', 'rentre', 'casa']),
  rule('list', 'mind', ['list', 'todo', 'to-do', 'checklist', 'liste']),
];

const SIZE_ICON: Record<Size, IconName> = { 0: 'foodTiny', 1: 'foodSmall', 2: 'foodMedium', 3: 'foodBig' };

function match(text: string): Rule | null {
  const t = normalize(text);
  let best: Rule | null = null;
  let bestAt = Infinity;
  for (const r of ACTIONS) {
    const at = r.test(t);
    if (at >= 0 && at < bestAt) {
      best = r;
      bestAt = at;
    }
  }
  if (best) return best;
  for (const r of TOPICS) if (r.test(t) >= 0) return r;
  return null;
}

export function biteIcon(text: string, size: Size): IconName {
  return match(text)?.icon ?? SIZE_ICON[size];
}

/** Which life area a bite belongs to (for a later colour dot), or null when no rule matches. */
export function biteGroup(text: string): BiteGroup | null {
  return match(text)?.group ?? null;
}
