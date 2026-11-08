import { biteIcon } from './bite-icon';

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
