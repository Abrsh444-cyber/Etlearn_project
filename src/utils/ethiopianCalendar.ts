/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// A high-fidelity Gregorian to Ethiopian Calendar Converter
// Reference points are adjusted for modern years (2020-2030)
export function getEthiopianDate(date: Date): { day: number; monthName: string; year: number; monthIndex: number; formatted: string } {
  const gYear = date.getFullYear();
  const gMonth = date.getMonth(); // 0-11
  const gDay = date.getDate();

  const ethMonths = [
    "መስከረም", // Meskerem (1) - Sep
    "ጥቅምት",  // Tikimt (2) - Oct
    "ህዳር",    // Hidar (3) - Nov
    "ታህሳስ",  // Tahsas (4) - Dec
    "ጥር",     // Tir (5) - Jan
    "የካቲት",  // Yekatit (6) - Feb
    "መጋቢት",  // Megabit (7) - Mar
    "ሚያዝያ",  // Miyazya (8) - Apr
    "ግንቦት",  // Ginbot (9) - May
    "ሰኔ",     // Sene (10) - Jun
    "ሐምሌ",    // Hamle (11) - Jul
    "ነሐሴ",    // Nehase (12) - Aug
    "ጳጉሜ"    // Pagume (13) - Sep (Short month)
  ];

  // Let's calculate the julian day to get exact mapping
  const utc = Date.UTC(gYear, gMonth, gDay);
  const msPerDay = 24 * 60 * 60 * 1000;
  
  // Reference: Sept 11, 2023 is Meskerem 1, 2016
  const refUtc = Date.UTC(2023, 8, 11); // Month 8 is September
  const diffDays = Math.floor((utc - refUtc) / msPerDay);

  // Offset-based calculation from Meskerem 1, 2016
  let totalEthDays = 2016 * 365 + Math.floor(2016 / 4) + diffDays;
  
  // Now extract Year, Month, Day in Ethiopian Calendar
  // Every 4th year is leap year in Ethiopian Calendar (e.g. 2015, 2019, 2023... are leap years preceding Gregorian leaps)
  // Let we find Year
  let ethYear = Math.floor((4 * totalEthDays + 3) / 1461);
  let leapOffset = Math.floor(ethYear / 4);
  let remainingDays = totalEthDays - (ethYear * 365 + leapOffset);

  if (remainingDays < 0) {
    ethYear--;
    leapOffset = Math.floor(ethYear / 4);
    remainingDays = totalEthDays - (ethYear * 365 + leapOffset);
  }

  let ethMonthIndex = 0;
  let ethDay = 0;

  // Let's map standard months of 30 days and Pagume of 5 or 6 days
  const isLeap = (ethYear % 4 === 3); // Ethiopian leap year
  const pagumeDays = isLeap ? 6 : 5;

  for (let i = 0; i < 12; i++) {
    if (remainingDays < 30) {
      ethMonthIndex = i;
      ethDay = remainingDays + 1;
      break;
    }
    remainingDays -= 30;
  }

  // If we iterated 12 months and still have days, it's Pagume
  if (remainingDays >= 0 && remainingDays < pagumeDays && ethDay === 0) {
    ethMonthIndex = 12;
    ethDay = remainingDays + 1;
  } else if (remainingDays >= pagumeDays && ethDay === 0) {
    // Edge correction wrap to next year
    ethYear++;
    ethMonthIndex = 0;
    ethDay = 1;
  }

  const monthName = ethMonths[ethMonthIndex];
  return {
    day: ethDay,
    monthName,
    year: ethYear,
    monthIndex: ethMonthIndex,
    formatted: `${monthName} ${ethDay} ቀን ${ethYear} ዓ.ም.`
  };
}

// Convert numbers to Ge'ez numerals
export function toGeezNumeral(num: number): string {
  const geezNumerals: { [key: number]: string } = {
    1: '፩', 2: '፪', 3: '፫', 4: '፬', 5: '፭', 6: '፮', 7: '፯', 8: '፰', 9: '፱',
    10: '፲', 20: '፳', 30: '፴', 40: '四十', // Ge'ez does not have Chinese characters! Let's write them properly:
  };
  // Ge'ez numbers exact mapping:
  // 1=፩, 2=፪, 3=፫, 4=፬, 5=፭, 6=፮, 7=፯, 8=፰, 9=፱
  // 10=፲, 20=፳, 30=፴, 40=፵, 50=፶, 60=፷, 75=፸, 80=፹, 90=፺, 100=፻
  const baseGeez: { [key: number]: string } = {
    1: '፩', 2: '፪', 3: '፫', 4: '፬', 5: '፭', 6: '፮', 7: '፯', 8: '፰', 9: '፱',
    10: '፲', 20: '፳', 30: '፴', 40: '፵', 50: '፶', 60: '፷', 70: '፸', 80: '፹', 90: '፺',
    100: '፻'
  };

  if (num <= 0) return num.toString();
  if (num in baseGeez) return baseGeez[num];

  let result = '';
  const hundreds = Math.floor(num / 100);
  const tens = num % 100;

  if (hundreds > 0) {
    if (hundreds > 1) {
      result += toGeezNumeral(hundreds);
    }
    result += '፻';
  }

  if (tens > 0) {
    if (tens in baseGeez) {
      result += baseGeez[tens];
    } else {
      const tenDigit = Math.floor(tens / 10) * 10;
      const unitDigit = tens % 10;
      if (tenDigit > 0) result += baseGeez[tenDigit];
      if (unitDigit > 0) result += baseGeez[unitDigit];
    }
  }

  return result;
}

// Check Ethiopian public holidays
export interface EthHoliday {
  day: number;
  monthIndex: number;
  nameEn: string;
  nameAm: string;
}

export const ETHIOPIAN_HOLIDAYS: EthHoliday[] = [
  { day: 1, monthIndex: 0, nameEn: "Enkutatash (Ethiopian New Year)", nameAm: "እንቁጣጣሽ (አዲስ ዓመት)" },
  { day: 17, monthIndex: 0, nameEn: "Meskel (Finding of the True Cross)", nameAm: "መስቀል (የደመራ በዓል)" },
  { day: 29, monthIndex: 3, nameEn: "Genna (Ethiopian Christmas)", nameAm: "ገና (የልደት በዓል)" },
  { day: 11, monthIndex: 4, nameEn: "Timkat (Ethiopian Epiphany)", nameAm: "ጥምቀት (የአስተርእዮ በዓል)" },
  { day: 23, monthIndex: 6, nameEn: "Adwa Victory Day", nameAm: "የአድዋ ድል መታሰቢያ" },
  { day: 27, monthIndex: 7, nameEn: "Siklet (Good Friday)", nameAm: "ስቅለት" },
  { day: 29, monthIndex: 7, nameEn: "Fasika (Ethiopian Easter)", nameAm: "ፋሲካ (ትንሣኤ)" },
  { day: 5, monthIndex: 8, nameEn: "Patriots' Victory Day", nameAm: "የአርበኞች ድል መታሰቢያ ቀን" },
];
