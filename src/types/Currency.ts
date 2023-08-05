export class Currency {
  name: string;
  char: string;
  rate: number;
  constructor(name: string, char: string, rate = 1) {
    this.name = name;
    this.char = char;
    this.rate = rate;
  }
  value(n: number) {
    return `${this.char}${n * this.rate}`;
  }
  static get pack() {
    return {
      Dollar: (mod: number) => new Currency("Dollar", "$", mod * 1),
      Pound: (mod: number) => new Currency("Pound", "£", mod * 0.8),
      Ruble: (mod: number) => new Currency("Ruble", "₽", mod * 85),
      Euro: (mod: number) => new Currency("Euro", "€", mod * 0.9),
      Yen: (mod: number) => new Currency("Yen", "¥", mod * 143),
      UkrainianHryvnia: (mod: number) => new Currency("Ukrainian hryvnia", "₴", mod * 42)
    };
  }
}