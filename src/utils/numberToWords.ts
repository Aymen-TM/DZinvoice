const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

function convertLessThanOneThousand(num: number): string {
  if (num === 0) return '';

  if (num < 10) {
    return units[num];
  }

  if (num < 20) {
    return teens[num - 10];
  }

  if (num < 100) {
    if (num % 10 === 0) {
      return tens[Math.floor(num / 10)];
    }
    if (num < 70) {
      return tens[Math.floor(num / 10)] + '-' + units[num % 10];
    }
    if (num < 80) {
      return 'soixante-' + teens[num - 60];
    }
    return 'quatre-vingt-' + units[num % 10];
  }

  if (num < 200) {
    return 'cent ' + convertLessThanOneThousand(num % 100);
  }

  return units[Math.floor(num / 100)] + ' cent' + (num % 100 === 0 ? '' : ' ' + convertLessThanOneThousand(num % 100));
}

export function numberToFrenchWords(num: number): string {
  if (num === 0) return 'zéro';

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let result = '';

  if (integerPart === 0) {
    result = 'zéro';
  } else {
    const billions = Math.floor(integerPart / 1000000000);
    const millions = Math.floor((integerPart % 1000000000) / 1000000);
    const thousands = Math.floor((integerPart % 1000000) / 1000);
    const hundreds = integerPart % 1000;

    if (billions > 0) {
      result += (billions === 1 ? 'un milliard' : convertLessThanOneThousand(billions) + ' milliards') + ' ';
    }

    if (millions > 0) {
      result += (millions === 1 ? 'un million' : convertLessThanOneThousand(millions) + ' millions') + ' ';
    }

    if (thousands > 0) {
      result += (thousands === 1 ? 'mille' : convertLessThanOneThousand(thousands) + ' mille') + ' ';
    }

    if (hundreds > 0) {
      result += convertLessThanOneThousand(hundreds);
    }
  }

  result = result.trim();

  if (decimalPart > 0) {
    result += ' dinars et ' + convertLessThanOneThousand(decimalPart) + ' centimes';
  } else {
    result += ' dinars';
  }

  return result.charAt(0).toUpperCase() + result.slice(1);
} 