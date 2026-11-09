import type { IconName } from '@/components/icon';
import type { Size } from '@/state/schema';

/**
 * Pick an icon from what the bite is about (Anass: one carrot everywhere looked lazy; then
 * "smart: an email task shows an email icon"). First matching rule wins, so specific words come
 * before general ones. No match → the size's food icon. Plain rules, no AI (DECISIONS: editable
 * rules in the core loop).
 *
 * Each word also matches its usual endings (emails, calling, texted, cleaner), and French words
 * are in the same lists (many users write in French). Word edges are Unicode-aware so accents work.
 */
const ENDINGS = '(?:s|es|ed|d|ing|er|ers)?';
const rule = (icon: IconName, ...words: string[]): [RegExp, IconName] => [
  new RegExp(`(?:^|[^\\p{L}\\p{N}])(?:${words.join('|')})${ENDINGS}(?=$|[^\\p{L}\\p{N}])`, 'iu'),
  icon,
];

const RULES: [RegExp, IconName][] = [
  rule('mail', 'e-?mail', 'inbox', 'newsletter', 'gmail', 'outlook', 'courriel', 'mail', 'correo'),
  rule('pay', 'pay', 'paid', 'bill', 'rent', 'invoice', 'subscription', 'refund', 'payer', 'facture', 'loyer', 'abonnement', 'rembourse', 'pagar', 'factura', 'alquiler'),
  rule('phone', 'call', 'phone', 'ring', 'voicemail', 'facetime', 'appel', 'appeler', 'appelle', 'téléphone', 'téléphoner', 'llamar', 'llama'),
  rule('message', 'text', 'message', 'dm', 'reply', 'respond', 'whatsapp', 'telegram', 'chat', 'snap', 'instagram', 'texto', 'répondre', 'réponds', 'mensaje', 'responder'),
  rule('laundry', 'laundry', 'wash (?:my )?clothes', 'fold', 'iron', 'ironing', 'lessive', 'linge', 'repasser'),
  rule('clean', 'dish', 'dishes', 'clean', 'tidy', 'vacuum', 'mop', 'dust', 'declutter', 'organi[sz]e', 'room', 'desk', 'ménage', 'nettoyer', 'ranger', 'vaisselle', 'aspirateur', 'limpiar', 'ordenar', 'platos'),
  rule('shower', 'shower', 'bath', 'brush (?:my )?teeth', 'skincare', 'shave', 'douche', 'bain', 'dents'),
  rule('cook', 'cook', 'dinner', 'lunch', 'breakfast', 'meal ?prep', 'bake', 'recipe', 'cuisiner', 'cuisine', 'repas', 'dîner', 'déjeuner', 'petit[- ]déj', 'cocinar', 'cena', 'comida'),
  rule('gym', 'gym', 'workout', 'run', 'running', 'jog', 'yoga', 'stretch', 'push-?ups?', 'exercise', 'train', 'training', 'sport', 'salle', 'courir', 'footing', 'muscu'),
  rule('walk', 'walk', 'step outside', 'go outside', 'fresh air', 'hike', 'marcher', 'promenade', 'balade'),
  rule('drop', 'water', 'drink', 'hydrate', 'boire', 'eau'),
  rule('shop', 'groceries', 'grocery', 'buy', 'bought', 'shop', 'shopping', 'order', 'amazon', 'pick up', 'courses', 'acheter', 'commander', 'comprar', 'compras'),
  rule('money', 'bank', 'budget', 'tax', 'taxes', 'money', 'saving', 'savings', 'transfer', 'banque', 'impôts?', 'argent', 'virement'),
  rule('health', 'pill', 'pills', 'meds', 'medicine', 'vitamin', 'vitamins', 'pharmacy', 'prescription', 'médicaments?', 'pharmacie', 'ordonnance'),
  rule('doctor', 'doctor', 'dentist', 'therapy', 'therapist', 'appointment', 'clinic', 'hospital', 'médecin', 'docteur', 'dentiste', 'rendez-vous', 'rdv', 'psy', 'médico', 'cita'),
  rule('write', 'essay', 'write', 'writing', 'wrote', 'draft', 'journal', 'note', 'notes', 'letter', 'blog', 'écrire', 'rédiger', 'rédaction', 'dissertation', 'lettre'),
  rule('study', 'study', 'studies', 'studying', 'exam', 'homework', 'assignment', 'class', 'lecture', 'revise', 'revision', 'quiz', 'réviser', 'révision', 'examen', 'devoirs?', 'cours', 'partiel', 'estudiar', 'examen', 'tarea', 'deberes'),
  rule('book', 'read', 'reading', 'book', 'chapter', 'article', 'page', 'lire', 'livre', 'chapitre', 'leer', 'libro'),
  rule('slides', 'slides', 'presentation', 'deck', 'pitch', 'présentation', 'diapo'),
  rule('code', 'code', 'coding', 'bug', 'deploy', 'commit', 'github', 'app', 'website', 'site'),
  rule('laptop', 'laptop', 'computer', 'update', 'backup', 'install', 'download', 'ordi', 'ordinateur'),
  rule('work', 'work', 'meeting', 'boss', 'client', 'project', 'report', 'job', 'apply', 'cv', 'resume', 'interview', 'travail', 'réunion', 'projet', 'rapport', 'stage', 'entretien'),
  rule('calendar', 'calendar', 'schedule', 'plan', 'planning', 'book a', 'reserve', 'deadline', 'agenda', 'réserver', 'planifier'),
  rule('travel', 'flight', 'trip', 'travel', 'pack', 'packing', 'suitcase', 'visa', 'passport', 'vol', 'voyage', 'valise', 'billet', 'passeport'),
  rule('car', 'car', 'drive', 'driving', 'gas', 'fuel', 'parking', 'mechanic', 'voiture', 'essence', 'garage'),
  rule('pet', 'dog', 'cat', 'pet', 'vet', 'feed the', 'chien', 'chat', 'véto'),
  rule('plant', 'plant', 'plants', 'garden', 'water the', 'flower', 'flowers', 'plantes?', 'jardin', 'fleurs?'),
  rule('people', 'mom', 'dad', 'mum', 'grandma', 'grandpa', 'family', 'friend', 'friends', 'sister', 'brother', 'birthday', 'party', 'maman', 'papa', 'mère', 'père', 'famille', 'amis?', 'soeur', 'sœur', 'frère', 'anniversaire', 'mama', 'baba', 'abuela', 'abuelo', 'mamá', 'papá', 'hermana', 'hermano', 'amigos?'),
  rule('baby', 'baby', 'kid', 'kids', 'school run', 'daycare', 'bébé', 'enfants?', 'crèche'),
  rule('fix', 'fix', 'repair', 'assemble', 'ikea', 'tool', 'réparer', 'bricolage', 'monter'),
  rule('cut', 'haircut', 'nails', 'barber', 'coiffeur', 'ongles'),
  rule('paint', 'paint', 'draw', 'drawing', 'sketch', 'art', 'design', 'peindre', 'dessiner', 'dessin'),
  rule('music', 'music', 'practice', 'guitar', 'piano', 'song', 'playlist', 'musique', 'guitare', 'chanson'),
  rule('record', 'record', 'podcast', 'voice ?note', 'vocal', 'enregistrer'),
  rule('game', 'game', 'play', 'jeu', 'jouer'),
  rule('bed', 'sleep', 'nap', 'bed', 'rest', 'dormir', 'sieste', 'lit'),
  rule('trash', 'trash', 'garbage', 'recycling', 'bin', 'poubelle', 'ordures'),
  rule('list', 'list', 'todo', 'to-do', 'checklist', 'liste'),
];

const SIZE_ICON: Record<Size, IconName> = { 0: 'foodTiny', 1: 'foodSmall', 2: 'foodMedium', 3: 'foodBig' };

export function biteIcon(text: string, size: Size): IconName {
  for (const [re, icon] of RULES) if (re.test(text)) return icon;
  return SIZE_ICON[size];
}
