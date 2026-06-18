/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PracticeQuestion {
  id: string;
  subject: string;
  grade: string; // "Grade 9" | "Grade 10" | "Grade 11" | "Grade 12" | "University"
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const PRACTICE_QUESTIONS: PracticeQuestion[] = [
  // === MATHEMATICS ===
  {
    id: "m1",
    subject: "Mathematics",
    grade: "Grade 9",
    question: "Solve the linear equation: 3x - 7 = 5x + 9. What is the value of x?",
    options: ["x = -8", "x = 8", "x = -1", "x = 4"],
    correctAnswer: "x = -8",
    explanation: "Subtracting 3x from both sides gives -7 = 2x + 9. Subtracting 9 gives -16 = 2x, so x = -8."
  },
  {
    id: "m2",
    subject: "Mathematics",
    grade: "Grade 10",
    question: "What are the roots of the quadratic equation: x² - 5x + 6 = 0?",
    options: ["x = 2 and x = 3", "x = -2 and x = -3", "x = 1 and x = 6", "x = 0 and x = 5"],
    correctAnswer: "x = 2 and x = 3",
    explanation: "Factoring the equation gives (x - 2)(x - 3) = 0. Therefore, the roots are x = 2 and x = 3."
  },
  {
    id: "m3",
    subject: "Mathematics",
    grade: "Grade 11",
    question: "If matrix A is [[1, 2], [3, 4]], what is the determinant of A?",
    options: ["-2", "2", "10", "-10"],
    correctAnswer: "-2",
    explanation: "The determinant of a 2x2 matrix [[a, b], [c, d]] is ad - bc. Here, (1*4) - (2*3) = 4 - 6 = -2."
  },
  {
    id: "m4",
    subject: "Mathematics",
    grade: "Grade 12",
    question: "Evaluate the limit as x approaches 3 of: (x² - 9) / (x - 3).",
    options: ["6", "3", "0", "Undefined / Indeterminate"],
    correctAnswer: "6",
    explanation: "Factor the numerator: (x - 3)(x + 3) / (x - 3). Cancel out (x - 3) to get (x + 3). As x approaches 3, 3 + 3 = 6."
  },
  {
    id: "m5",
    subject: "Mathematics",
    grade: "University",
    question: "What is the derivative of f(x) = ln(x) with respect to x?",
    options: ["1/x", "e^x", "1/(x²)", "ln(x)/x"],
    correctAnswer: "1/x",
    explanation: "The standard fundamental derivative of the natural logarithm function ln(x) is 1/x for all x > 0."
  },

  // === PHYSICS ===
  {
    id: "p1",
    subject: "Physics",
    grade: "Grade 9",
    question: "According to Newton's Second Law of Motion, what is the formula relating Force (F), Mass (m), and Acceleration (a)?",
    options: ["F = m * a", "F = m / a", "F = a / m", "F = m + a"],
    correctAnswer: "F = m * a",
    explanation: "Newton's Second Law states that force is directly proportional to the product of mass and acceleration (F = ma)."
  },
  {
    id: "p2",
    subject: "Physics",
    grade: "Grade 10",
    question: "A ball is thrown horizontally from a cliff of 45m. Assuming g = 10 m/s², how long does it take to reach the ground?",
    options: ["3 seconds", "4.5 seconds", "9 seconds", "1.5 seconds"],
    correctAnswer: "3 seconds",
    explanation: "Using d = 0.5 * g * t²: 45 = 0.5 * 10 * t² => 45 = 5 * t² => t² = 9 => t = 3 seconds."
  },
  {
    id: "p3",
    subject: "Physics",
    grade: "Grade 11",
    question: "Which thermodynamic process occurs at a constant volume, meaning no work is done on or by the gas?",
    options: ["Isochoric / Isovolumetric", "Isobaric", "Isothermal", "Adiabatic"],
    correctAnswer: "Isochoric / Isovolumetric",
    explanation: "In an isochoric process, volume remains constant (ΔV = 0), so work done W = P*ΔV = 0."
  },
  {
    id: "p4",
    subject: "Physics",
    grade: "Grade 12",
    question: "What does the photoelectric effect prove about the nature of light?",
    options: ["Light has a particle-like nature (photons)", "Light acts exclusively as a longitudinal mechanical wave", "Light cannot travel through vacuum barriers", "Light travels faster in glass than in air"],
    correctAnswer: "Light has a particle-like nature (photons)",
    explanation: "Einstein explained the photoelectric effect by treating light as quantized packages of energy called photons, proving particulate nature."
  },
  {
    id: "p5",
    subject: "Physics",
    grade: "University",
    question: "In Special Relativity, what happens to the measured length of an object as its speed approaches the speed of light relative to an observer?",
    options: ["Length contracts in the direction of motion", "Length dilates and expands infinitely", "Length remains absolutely identical", "The object flips into a three-dimensional reverse sphere"],
    correctAnswer: "Length contracts in the direction of motion",
    explanation: "According to Lorentz contraction, objects moving close to the speed of light contract in length along their direction of movement."
  },

  // === CHEMISTRY ===
  {
    id: "c1",
    subject: "Chemistry",
    grade: "Grade 9",
    question: "Which of the following is the chemical symbol for Gold, a precious historical resource of Ethiopia?",
    options: ["Au", "Ag", "Fe", "Gd"],
    correctAnswer: "Au",
    explanation: "The chemical symbol for Gold is Au, derived from its Latin name 'Aurum'."
  },
  {
    id: "c2",
    subject: "Chemistry",
    grade: "Grade 10",
    question: "What is the pH level of a completely neutral aqueous solution at 25°C?",
    options: ["7", "1", "14", "0"],
    correctAnswer: "7",
    explanation: "A neutral solution (such as pure distilled water) has a pH of exactly 7."
  },
  {
    id: "c3",
    subject: "Chemistry",
    grade: "Grade 11",
    question: "Which type of chemical bond is formed when pair of electrons is shared equally between two non-metal atoms?",
    options: ["Covalent bond", "Ionic bond", "Metallic bond", "Hydrogen bond"],
    correctAnswer: "Covalent bond",
    explanation: "Covalent bonding involves the sharing of electron pairs between atoms, typically non-metals."
  },
  {
    id: "c4",
    subject: "Chemistry",
    grade: "Grade 12",
    question: "What is the functional group that defines all organic Alcohols?",
    options: ["Hydroxyl group (-OH)", "Carboxyl group (-COOH)", "Carbonyl group (C=O)", "Amino group (-NH2)"],
    correctAnswer: "Hydroxyl group (-OH)",
    explanation: "Alcohols contain one or more hydroxyl (-OH) groups attached to a carbon atom."
  },
  {
    id: "c5",
    subject: "Chemistry",
    grade: "University",
    question: "According to the Brønsted-Lowry definition, what is an acid?",
    options: ["A proton (H+) donor", "A proton (H+) acceptor", "An electron pair donor", "A hydroxide (OH-) generator"],
    correctAnswer: "A proton (H+) donor",
    explanation: "The Brønsted-Lowry theory defines an acid as any substance that can donate a hydrogen ion / proton (H+)."
  },

  // === BIOLOGY ===
  {
    id: "b1",
    subject: "Biology",
    grade: "Grade 9",
    question: "Which cell organelle is widely referred to as the 'powerhouse of the cell' for generating ATP energy?",
    options: ["Mitochondrion", "Nucleus", "Ribosome", "Golgi apparatus"],
    correctAnswer: "Mitochondrion",
    explanation: "Mitochondria produce most of the cell's supply of adenosine triphosphate (ATP) via cellular respiration."
  },
  {
    id: "b2",
    subject: "Biology",
    grade: "Grade 10",
    question: "What is the primary green pigment in plants that absorbs light energy to fuel photosynthesis?",
    options: ["Chlorophyll", "Carotenoids", "Hemoglobin", "Melanin"],
    correctAnswer: "Chlorophyll",
    explanation: "Chlorophyll is the green pigment in chloroplasts that absorbs red and blue light to power carbohydrate synthesis."
  },
  {
    id: "b3",
    subject: "Biology",
    grade: "Grade 11",
    question: "Which blood vessels carry oxygenated blood away from the heart to the rest of the body?",
    options: ["Arteries", "Veins", "Capillaries", "Lymph vessels"],
    correctAnswer: "Arteries",
    explanation: "Arteries transport oxygen-rich blood away from the heart (with the exception of the pulmonary artery)."
  },
  {
    id: "b4",
    subject: "Biology",
    grade: "Grade 12",
    question: "In genetics, what is the process of synthesizing an RNA molecule from a DNA template strand called?",
    options: ["Transcription", "Translation", "Replication", "Fermentation"],
    correctAnswer: "Transcription",
    explanation: "Transcription is the enzyme-catalyzed process of copying a structural segment of DNA into complementary messenger RNA (mRNA)."
  },
  {
    id: "b5",
    subject: "Biology",
    grade: "University",
    question: "Which plant hormone is primarily responsible for promoting cell elongation and phototropism?",
    options: ["Auxin", "Ethylene", "Abscisic Acid", "Gibberellin"],
    correctAnswer: "Auxin",
    explanation: "Auxins accumulate on the shaded side of a plant stem, causing cell elongation which tilts the plant toward sunlight."
  },

  // === ENGLISH ===
  {
    id: "e1",
    subject: "English",
    grade: "Grade 9",
    question: "Complete the sentence with the correct preposition: 'The student was highly praised _____ completing her homework early.'",
    options: ["for", "at", "by", "with"],
    correctAnswer: "for",
    explanation: "The correct idiom is 'praised for' something (e.g., 'praised for completing her assignment')."
  },
  {
    id: "e2",
    subject: "English",
    grade: "Grade 10",
    question: "Identify the correct verb tense: 'By the time the bell rang, the teacher _____ writing explanation keys on the board.'",
    options: ["had finished", "has finished", "finishes", "will finish"],
    correctAnswer: "had finished",
    explanation: "Past Perfect ('had finished') is used to express an action that was completed before another event in the past ('the bell rang')."
  },
  {
    id: "e3",
    subject: "English",
    grade: "Grade 11",
    question: "Change this active sentence to passive: 'The young boy ate the sweet, soft injera.'",
    options: ["The sweet, soft injera was eaten by the young boy.", "The sweet, soft injera ate the young boy.", "Injera has been eaten by the boy.", "The boy had eaten the sweet, soft injera."],
    correctAnswer: "The sweet, soft injera was eaten by the young boy.",
    explanation: "In passive voice, the object ('injera') becomes the subject, combined with 'was' + past participle ('eaten')."
  },
  {
    id: "e4",
    subject: "English",
    grade: "Grade 12",
    question: "Complete the sentence: 'If I _____ harder, I would have passed the national examination with a perfect score.'",
    options: ["had studied", "study", "studied", "would study"],
    correctAnswer: "had studied",
    explanation: "This is a Third Conditional sentence expressing past regret. The pattern is 'If + past perfect' combined with 'would have + past participle'."
  },
  {
    id: "e5",
    subject: "English",
    grade: "University",
    question: "Choose the correct relative pronoun: 'The academic professor, _____ book we read, recently won a prestigious award.'",
    options: ["whose", "whom", "who", "which"],
    correctAnswer: "whose",
    explanation: "The possessive relative pronoun 'whose' is used to connect the professor to the book they authored."
  },

  // === AMHARIC ===
  {
    id: "a1",
    subject: "Amharic",
    grade: "Grade 9",
    question: "ከሚከተሉት አማራጮች ውስጥ ትክክለኛውን የግሥ ተባዕታይ/አንስታይ አጣማሪ ያሳየው የትኛው ነው?",
    options: ["እሱ መጣ / እሷ መጣች", "እሱ መጣች / እሷ መጣ", "እኛ መጣሽ / አንቺ መጣን", "እነሱ መጣሁ / እኔ መጡ"],
    correctAnswer: "እሱ መጣ / እሷ መጣች",
    explanation: "በአማርኛ ሰዋስው 'እሱ' ከተባዕታይ ግሥ 'መጣ' ጋር ሲጣመር 'እሷ' ደግሞ ከአንስታይ ግሥ 'መጣች' ጋር ይዋሃዳል።"
  },
  {
    id: "a2",
    subject: "Amharic",
    grade: "Grade 10",
    question: "የሚከተለው ምሳሌያዊ አነጋገር ምን ማለት ነው? 'ድር ቢያብር አንበሳ ያስር'።",
    options: ["አንድነትና መተባበር ኃይል ይሰጣል", "ክር አንበሳን በቀላሉ ማሰር ይችላል", "ድር ማደራጀት አስቸጋሪ ነው", "አንበሳ በጣም ደካማ እንስሳ ነው"],
    correctAnswer: "አንድነትና መተባበር ኃይል ይሰጣል",
    explanation: "ይህ ምሳሌያዊ አነጋገር ሰዎች በአንድነትና በትብብር ከቆሙ ምንም ያህል ፈታኝ የሆነን ችግር ማሸነፍ እንደሚችሉ ያስተምራል።"
  },
  {
    id: "a3",
    subject: "Amharic",
    grade: "Grade 11",
    question: "በአማርኛ ቋንቋ ሰዋስው ውስጥ 'ባለቤት' ማለት ምን ማለት ነው?",
    options: ["ድርጊቱን የሚፈጽመው አካል (ግለሰብ/ነገር)", "የቤቱ ትክክለኛ ባለቤት", "ድርጊቱ የተፈጸመበት ነገር", "የዓረፍተ ነገሩ ማጠናቀቂያ ገላጭ"],
    correctAnswer: "ድርጊቱን የሚፈጽመው አካል (ግለሰብ/ነገር)",
    explanation: "'ባለቤት' ማለት በዓረፍተ ነገር ውስጥ ድርጊቱን ወይም ክስተቱን በቀጥታ የሚፈጽም ወይም የሚወክል የዕውቀት አካል ነው።"
  },
  {
    id: "a4",
    subject: "Amharic",
    grade: "Grade 12",
    question: "ከሚከተሉት ቃላት ውስጥ የ'ብርቱ' ተቃራኒ ቃል የትኛው ነው?",
    options: ["ደካማ", "ጠንካራ", "ታታሪ", "አረጋዊ"],
    correctAnswer: "ደካማ",
    explanation: "'ብርቱ' ማለት ጠንካራ፣ ጎበዝ፣ ታታሪ ማለት ሲሆን ተቃራኒው ደግሞ 'ደካማ' ነው።"
  },
  {
    id: "a5",
    subject: "Amharic",
    grade: "University",
    question: "'የቆጡን አወርድ ብላ የብብቷንጣለች' የሚለው ምሳሌያዊ አነጋገር ፍቺ ምንድነው?",
    options: ["ስግብግብነት ያለን ነገር ያሳጣል", "በላይ ያለን ዕቃ ለማውረድ መሞከር", "ሁሉንም በአንድነት ማግኘት መቻል", "ቅርብ ያለን ዕቃ መልቀቅ"],
    correctAnswer: "ስግብግብነት ያለን ነገር ያሳጣል",
    explanation: "ይህ ምሳሌያዊ አነጋገር ሰው ካለው ነገር በላይ ሳይረጋገጥ ሌላ ሲመኝ የነበረውንም ጭምር እንደሚያጣ የሚያስጠነቅቅ ጥበብ ነው።"
  },

  // === HISTORY ===
  {
    id: "h1",
    subject: "History",
    grade: "Grade 9",
    question: "The ancient Kingdom of Aksum is renowned for erecting colossal carved stone monoliths. What are these monuments called?",
    options: ["Stele / Obelisks", "Pyramids", "Cathedrals", "Towers of Gonder"],
    correctAnswer: "Stele / Obelisks",
    explanation: "Aksumite civilization is famous for its colossal monolithic stone Stele (Obelisks) representing elite burials and power."
  },
  {
    id: "h2",
    subject: "History",
    grade: "Grade 10",
    question: "In which year did the spectacular Battle of Adwa take place, where Ethiopia defeated Italian colonial forces?",
    options: ["1896", "1935", "1872", "1941"],
    correctAnswer: "1896",
    explanation: "The historic Battle of Adwa was fought on March 1, 1896 (Gregorian calendar), representing a definitive victory for sovereign independence."
  },
  {
    id: "h3",
    subject: "History",
    grade: "Grade 11",
    question: "Which royal Emperor initiated the establishment of Gondar as the permanent imperial capital of Ethiopia in 1636?",
    options: ["Emperor Fasilides", "Emperor Tewodros II", "Emperor Yohannes IV", "Emperor Lalibela"],
    correctAnswer: "Emperor Fasilides",
    explanation: "Emperor Fasilides established Gonder as the permanent imperial capital and constructed the magnificent Fasil Ghebbi castle compound."
  },
  {
    id: "h4",
    subject: "History",
    grade: "Grade 12",
    question: "Who was the legendary legal and state architect of modern Ethiopia, reigning as sovereign Emperor from 1889 to 1913?",
    options: ["Emperor Menelik II", "Emperor Haile Selassie I", "Emperor Tewodros II", "Emperor Iyasu"],
    correctAnswer: "Emperor Menelik II",
    explanation: "Emperor Menelik II unified modern Ethiopia, founded Addis Ababa, and successfully defended national sovereignty at Adwa."
  },
  {
    id: "h5",
    subject: "History",
    grade: "University",
    question: "Which ancient written document serves as the repository of state law and imperial succession legitimacy in historical Christian Ethiopia?",
    options: ["Kebra Nagast (Glory of the Kings)", "Fetha Nagast (The Law of the Kings)", "Serata Ge'ez", "The Chronicle of Zara Yaqob"],
    correctAnswer: "Fetha Nagast (The Law of the Kings)",
    explanation: "The Fetha Nagast is the historic legal code introduced around the 15th century, governing ecclesiastical and civil legislation."
  },

  // === GEOGRAPHY ===
  {
    id: "g1",
    subject: "Geography",
    grade: "Grade 9",
    question: "Which spectacular geological feature divides the Ethiopian Highlands into Eastern and Western sections?",
    options: ["The Great Rift Valley", "The Sahara Desert", "The Simien Mountains", "The Nile River Delta"],
    correctAnswer: "The Great Rift Valley",
    explanation: "The Great East African Rift Valley cleaves the country diagonally, creating distinct western and eastern high mountain segments."
  },
  {
    id: "g2",
    subject: "Geography",
    grade: "Grade 10",
    question: "What is the name of Ethiopia's largest freshwater lake, which also acts as the primary source of the Blue Nile (Abay) River?",
    options: ["Lake Tana", "Lake Abaya", "Lake Chamo", "Lake Langano"],
    correctAnswer: "Lake Tana",
    explanation: "Lake Tana in northern Amhara region is the largest lake in Ethiopia, and its southern outlet feeds the mighty Blue Nile River."
  },
  {
    id: "g3",
    subject: "Geography",
    grade: "Grade 11",
    question: "Which climate zone in the traditional Ethiopian classification covers dry tropical lowlands with temperatures above 26°C?",
    options: ["Qolla (Hot Lowlands)", "Dega (Cool Highlands)", "Weyna Dega (Temperate Highlands)", "Bereha (Desert)"],
    correctAnswer: "Qolla (Hot Lowlands)",
    explanation: "Qolla represents warm, semi-arid tropical regions up to 1,500m elevation. Weyna Dega is temperate, and Dega constitutes cool altitudes."
  },
  {
    id: "g4",
    subject: "Geography",
    grade: "Grade 12",
    question: "What is the highest peak in Ethiopia, situated within the majestic Simien Mountains National Park?",
    options: ["Ras Dashen", "Mount Batu", "Mount Gughe", "Mount Zuqualla"],
    correctAnswer: "Ras Dashen",
    explanation: "Ras Dashen stands at 4,550 meters (14,928 ft) above sea level, making it the highest mountain peak in Ethiopia."
  },
  {
    id: "g5",
    subject: "Geography",
    grade: "University",
    question: "In hydrology, approximately what percentage of the Blue Nile's (Abay River) net water volume originates from the highlands of Ethiopia?",
    options: ["Over 85%", "Around 25%", "Around 50%", "Less than 10%"],
    correctAnswer: "Over 85%",
    explanation: "The Ethiopian highlands supply more than 85% of the total Nile River water volume via the Blue Nile (Abay), Atbara, and Sobat rivers."
  }
];
