import type { IconName } from '@/components/icon';
import type { Size } from '@/state/schema';

/**
 * Pick an icon from what the bite is about (Anass: one carrot everywhere looked lazy).
 * First matching rule wins, so specific words come before general ones. No match → the
 * size's food icon. Plain rules, no AI (DECISIONS: editable rules in the core loop).
 */
const RULES: [RegExp, IconName][] = [
  [/\b(e-?mail|inbox|newsletter)\b/i, 'mail'],
  [/\b(pay|bill|rent|invoice|subscription|refund)\b/i, 'pay'],
  [/\b(call|phone|ring|voicemail)\b/i, 'phone'],
  [/\b(text|message|dm|reply|whatsapp|telegram|chat)\b/i, 'message'],
  [/\b(laundry|wash (my )?clothes|fold|ironing?)\b/i, 'laundry'],
  [/\b(dishes|clean|tidy|vacuum|mop|dust|declutter|organi[sz]e|room|desk)\b/i, 'clean'],
  [/\b(shower|bath|brush (my )?teeth|skincare|shave)\b/i, 'shower'],
  [/\b(cook|dinner|lunch|breakfast|meal ?prep|bake|recipe)\b/i, 'cook'],
  [/\b(gym|workout|run|jog|yoga|stretch|push-?ups?|exercise|train)\b/i, 'gym'],
  [/\b(walk|step outside|go outside|fresh air|hike)\b/i, 'walk'],
  [/\b(water|drink|hydrate)\b/i, 'drop'],
  [/\b(groceries|grocery|buy|shop|shopping|order|amazon|pick up)\b/i, 'shop'],
  [/\b(bank|budget|taxes?|money|savings?|transfer)\b/i, 'money'],
  [/\b(pills?|meds|medicine|vitamins?|pharmacy|prescription)\b/i, 'health'],
  [/\b(doctor|dentist|therapy|therapist|appointment|clinic|hospital)\b/i, 'doctor'],
  [/\b(essay|write|writing|draft|journal|notes?|letter|blog)\b/i, 'write'],
  [/\b(study|exam|homework|assignment|class|lecture|revise|revision|quiz)\b/i, 'study'],
  [/\b(read|book|chapter|article|page)\b/i, 'book'],
  [/\b(slides|presentation|deck|pitch)\b/i, 'slides'],
  [/\b(code|bug|deploy|commit|github|app|website)\b/i, 'code'],
  [/\b(laptop|computer|update|backup|install|download)\b/i, 'laptop'],
  [/\b(work|meeting|boss|client|project|report|job|apply|cv|resume|interview)\b/i, 'work'],
  [/\b(calendar|schedule|plan|book a|reserve|deadline)\b/i, 'calendar'],
  [/\b(flight|trip|travel|pack|packing|suitcase|visa|passport)\b/i, 'travel'],
  [/\b(car|drive|gas|fuel|parking|mechanic)\b/i, 'car'],
  [/\b(dog|cat|pet|vet|feed the)\b/i, 'pet'],
  [/\b(plants?|garden|water the|flowers?)\b/i, 'plant'],
  [/\b(mom|dad|mum|grandma|grandpa|family|friends?|sister|brother|birthday|party)\b/i, 'people'],
  [/\b(baby|kids?|school run|daycare)\b/i, 'baby'],
  [/\b(fix|repair|assemble|ikea|tool)\b/i, 'fix'],
  [/\b(haircut|nails|barber)\b/i, 'cut'],
  [/\b(paint|draw|sketch|art|design)\b/i, 'paint'],
  [/\b(music|practice|guitar|piano|song|playlist)\b/i, 'music'],
  [/\b(record|podcast|voice ?note)\b/i, 'record'],
  [/\b(game|play)\b/i, 'game'],
  [/\b(sleep|nap|bed|rest)\b/i, 'bed'],
  [/\b(trash|garbage|recycling|bin)\b/i, 'trash'],
  [/\b(list|todo|to-do|checklist)\b/i, 'list'],
];

const SIZE_ICON: Record<Size, IconName> = { 0: 'foodTiny', 1: 'foodSmall', 2: 'foodMedium', 3: 'foodBig' };

export function biteIcon(text: string, size: Size): IconName {
  for (const [re, icon] of RULES) if (re.test(text)) return icon;
  return SIZE_ICON[size];
}
