/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Flashcard, Deck } from '../types';

export interface PrebuiltStudyNote {
  id: string;
  subject: string;
  title: string;
  intro: string;
  definition: string;
  explanation: string;
  diagram: string; // ASCII diagram
  summaryTable: { header: string[]; rows: string[][] };
  mnemonics: string;
  color: string;
}

const createCard = (id: string, question: string, answer: string, explanation: string): Flashcard => ({
  id,
  question,
  answer,
  explanation,
  interval: 0,
  repetition: 0,
  easeFactor: 2.5,
  dueDate: new Date().toISOString()
});

export const PREBUILT_DECKS: Deck[] = [
  {
    id: "deck_emerging_tech",
    title: "Emerging Technologies",
    subject: "Emerging Technologies",
    cards: [
      createCard("et_1", "What is the Internet of Things (IoT)?", "The network of physical objects ('things') embedded with sensors, software, and other technologies for exchanging data with other devices over the internet.", "Example: Smart coffee makers or thermostats tracking utility metrics automatically."),
      createCard("et_2", "Explain AR (Augmented Reality) vs. VR (Virtual Reality).", "AR overlays digital information on the real physical world. VR creates a fully simulated digital environment that completely isolates the user from the real world.", "AR: Pokémon Go, Google Glass. VR: Custom training simulators using headsets like Oculus Rift."),
      createCard("et_3", "What is the key difference between AI and Machine Learning?", "AI is the broad concept of creating machines capable of mimicking human intelligence. ML is a subset of AI that enables machines to learn from data without explicit programming.", "ML is the method we use to achieve AI (e.g., using neural networks)."),
      createCard("et_4", "What is Blockchain?", "A decentralized, distributed ledger technology that securely records transactions across a network of computers in a tamper-proof block structure.", "Once a record is written block-by-block, it cannot be altered without altering all subsequent blocks."),
      createCard("et_5", "What is Cloud Computing?", "The on-demand delivery of IT resources (databases, storage, compute power) over the internet with pay-as-you-go pricing.", "Instead of buying physical servers, you rent them virtually from providers like AWS or GCP."),
      createCard("et_6", "What is Cybersecurity?", "The practice of protecting systems, networks, and programs from digital attacks, theft, unauthorized access, and damage.", "Relies on three pillars: confidentiality, integrity, and availability (CIA Triad)."),
      createCard("et_7", "Define 5G Technology.", "The fifth-generation mobile network, designed to deliver peak data rates up to 20 Gbps, ultra-low latency, and massive device connectivity capacity.", "Key driver for autonomous cars and massive smart city grids."),
      createCard("et_8", "What is Edge Computing?", "A distributed computing paradigm that brings computation and data storage closer to the sources of data (the edge of the network) rather than relying solely on central clouds.", "Reduces latency and bandwidth use for immediate applications like localized industrial sensors."),
      createCard("et_9", "What is a Digital Twin?", "A highly accurate virtual replica of a physical asset, process, system, or environment designed to run simulations, monitor health, and optimize performance.", "Examples include virtual engine models used in aviation or structural grids in smart construction."),
      createCard("et_10", "What are Smart Cities?", "Urban areas that use IoT sensors, communication networks, and data analytics to optimize city services, manage resources sustainably, and improve residents' quality of life.", "Provides intelligent traffic lights, smart waste bins, and automated lighting."),
      createCard("et_11", "Define Autonomous Vehicles.", "Self-driving cars or trucks that use computer vision, radar, LIDAR, and AI algorithms to perceive their surroundings and navigate without human intervention.", "Operate in a high-density, real-time edge processing environment."),
      createCard("et_12", "What is Natural Language Processing (NLP)?", "A subfield of AI concerned with the interactions between computers and human language, permitting machines to read, decode, and interpret speech.", "Underpins systems like translation engines, chatbots, and Voice Assistants."),
      createCard("et_13", "What is Computer Vision?", "A field of artificial intelligence that trains computers to interpret, understand, and extract meaningful information from digital images and videos.", "Used in medical CT scans, face unlocking, and automated surveillance."),
      createCard("et_14", "What is Quantum Computing?", "A computing paradigm that utilizes subatomic particles (qubits) and quantum mechanics (superposition and entanglement) to solve highly complex mathematical problems.", "Can process complex calculations in minutes that take standard supercomputers millennia."),
      createCard("et_15", "Explain the concept of 'Ethical AI'.", "The set of guidelines that govern the design, deployment, and operation of AI models to ensure fairness, transparency, accountability, and privacy.", "Guards against algorithmic bias, privacy invasion, and mass disinformation."),
      createCard("et_16", "What are Deepfakes?", "Synthetic media in which a person in an existing image or video is replaced with someone else's likeness using deep generative neural networks.", "A key ethical concern in modern AI-augmented cyber threat spheres."),
      createCard("et_17", "What is Big Data?", "Extremely large, complex datasets that cannot be processed efficiently by traditional relational database engines.", "Characterized by the Five Vs: Volume, Velocity, Variety, Veracity, and Value."),
      createCard("et_18", "What is additive manufacturing commonly called?", "3D Printing.", "The process of creating a physical object from a three-dimensional digital model by laying down successive layers of material."),
      createCard("et_19", "Define Robotic Process Automation (RPA).", "Software technology that makes it easy to build, deploy, and manage software robots that emulate humans interacting with digital systems.", "Often used to automate clerical data entry tasks and report generation."),
      createCard("et_20", "What is the Metaverse?", "A collective, collaborative virtual shared space created by the convergence of virtually enhanced physical reality and physically persistent virtual space.", "Typically accessed through AR, VR headsets, and standard browsers.")
    ]
  },
  {
    id: "deck_economics",
    title: "Introduction to Economics",
    subject: "Introduction to Economics",
    cards: [
      createCard("ec_1", "What is the Law of Demand?", "The principle stating that, ceteris paribus (all other things being equal), as the price of a good falls, the quantity demanded rises, and vice-versa.", "Represents an inverse relationship between price and quantity demanded."),
      createCard("ec_2", "What is the Law of Supply?", "The principle stating that, ceteris paribus, as the price of a good increases, the quantity supplied increases, and vice-versa.", "Represents a direct, positive correlation between price and quantity supplied."),
      createCard("ec_3", "Define Elasticity of Demand.", "A measure of how responsive the quantity demanded of a service or good is to a change in its price.", "PD > 1 is elastic; PD < 1 is inelastic; PD = 1 is unit elastic."),
      createCard("ec_4", "What is Gross Domestic Product (GDP)?", "The total monetary value of all finished goods and services produced within a country's borders in a specific time period.", "Formula style: GDP = C + I + G + (X - M)."),
      createCard("ec_5", "What is Inflation?", "The general, gradual increase in price levels and a subsequent fall in the purchasing power of money over a period of time.", "Can be caused by demand-pull (high demand) or cost-push (rising production costs)."),
      createCard("ec_6", "Identify the 4 main types of Market Structures.", "Perfect Competition, Monopolistic Competition, Oligopoly, and Monopoly.", "A monopoly has 1 seller, while perfect competition has infinite buyers and sellers with identical goods."),
      createCard("ec_7", "Define Opportunity Cost.", "The value of the next best alternative given up (forgone) when making a choice.", "Example: Studying for an exam instead of going out means the opportunity cost is the entertainment forgone."),
      createCard("ec_8", "What is Comparative Advantage?", "The ability of an economic agent to produce a good or service at a lower opportunity cost than its competitors.", "The fundamental justification for free international trade partnerships."),
      createCard("ec_9", "Describe Fiscal Policy.", "The use of government spending and taxation to influence the level of economic activity and aggregate demand.", "Controlled by the Ministry of Finance / national government."),
      createCard("ec_10", "Describe Monetary Policy.", "The management of interest rates and the money supply by a central bank to control inflation, stabilize currency value, and support employment.", "Controlled in Ethiopia by the National Bank of Ethiopia (NBE)."),
      createCard("ec_11", "What is Consumer Surplus?", "The difference between the maximum price a consumer is willing to pay and the actual price they pay.", "Visually, it is the area below the demand curve and above the market price."),
      createCard("ec_12", "What is a Nash Equilibrium?", "A situation in game theory where no player can benefit by unilaterally changing their chosen strategy, assuming other players' strategies remain constant.", "Pioneered by John Nash."),
      createCard("ec_13", "Define Microeconomics.", "The branch of economics that studies the behavior of individual households, firms, and industries in allocating scarce resources.", "Focuses on individual market pricing and choices."),
      createCard("ec_14", "Define Macroeconomics.", "The study of the behavior of a national or global economy as a whole, focusing on indices like GDP, unemployment, and interest policies.", "Analyses collective aggregate indicators."),
      createCard("ec_15", "What is scarcity?", "The basic economic problem of satisfying unlimited human wants and needs with limited (scarce) resources.", "The very reason why economics exists as a field of study."),
      createCard("ec_16", "What is Command Economy vs Market Economy?", "A command economy is controlled entirely by a central government (prices and production are set). A market economy relies on supply, demand, and free enterprising.", "Ethiopia historically shifted from command (Derg era) to more market-liberalizing policies in recent decades."),
      createCard("ec_17", "What is a Giffen Good?", "An inferior good for which demand increases as the price increases, violating the general Law of Demand.", "Usually happens because the price increase leaves less income for superior foods (e.g., staple teff or potatoes)."),
      createCard("ec_18", "Define stagflation.", "A combination of slow economic growth (stagnation), high unemployment, and high inflation.", "A difficult policy paradox for central banks to tackle."),
      createCard("ec_19", "What is economic utility?", "The total satisfaction or value received by a consumer from consuming a good or service.", "Utilized in measuring consumer choice and equilibrium graphs."),
      createCard("ec_20", "What are tariffs?", "Taxes or duties imposed by a government on imported goods and services from other countries.", "Used as protective measures for local industries or to generate revenue.")
    ]
  },
  {
    id: "deck_biology",
    title: "General Biology",
    subject: "General Biology",
    cards: [
      createCard("bi_1", "What are the two major stages of Photosynthesis?", "The Light-Dependent Reactions (happening in the thylakoid membrane) and the Light-Independent Reactions / Calvin Cycle (occurring in the stroma).", "Inputs: Carbon Dioxide, Water, Sunlight. Outputs: Glucose and Oxygen."),
      createCard("bi_2", "How is ATP synthesized during cellular respiration?", "Through Chemiosmosis and Oxidative Phosphorylation, where protons flow down their gradient through the enzyme ATP Synthase.", "Yields the majority of ATP in aerobic respiration (approx. 32-34 ATPs per glucose molecule)."),
      createCard("bi_3", "Explain the lock-and-key model of enzyme activity.", "An enzyme's active site acts as a rigid lock, and only a substrate with a highly specific, matching shape (the key) can bind to and activate it.", "Later refined into the 'induced fit' model where active sites mold slightly around substrates."),
      createCard("bi_4", "Identify the three main processes of Cellular Respiration.", "Glycolysis (cytoplasm), Krebs Cycle / Citric Acid Cycle (mitochondrial matrix), and the Electron Transport Chain (inner mitochondrial membrane).", "Glycolysis is anaerobic (does not require oxygen), whereas the remaining steps require oxygen."),
      createCard("bi_5", "What is the Krebs Cycle?", "A series of chemical reactions in the mitochondria that oxidizes acetyl-CoA to produce NADH, FADH2, and ATP (GTP) while releasing carbon dioxide as waste.", "Discovered by Hans Krebs."),
      createCard("bi_6", "Briefly outline DNA Replication.", "The semi-conservative process where DNA helicase unwinds the double helix, and DNA polymerase synthesizes two new complementary strands using old strands as templates.", "Ensures exact genetic duplication before cell division."),
      createCard("bi_7", "Contrast Mitosis vs Meiosis.", "Mitosis produces 2 identical diploid daughter cells for body growth and repair. Meiosis produces 4 genetically unique haploid gamete (sex) cells for reproduction.", "Mitosis has 1 division stage; Meiosis has 2 consecutive division stages."),
      createCard("bi_8", "Identify the steps in Protein Synthesis.", "Transcription (rewriting DNA into mRNA in the nucleus) and Translation (ribosomes reading mRNA to construct a specific amino acid polypeptide chain in cytoplasm).", "Underpins the 'Central Dogma' of biology (DNA -> RNA -> Protein)."),
      createCard("bi_9", "Name 5 key cell organelles and their primary functions.", "Nucleus (genetic control), Mitochondria (ATP generator), Ribosome (protein synthesis), Endoplasmic Reticulum (molecule transport/folding), Golgi Apparatus (sorting/shipping).", "Plants also have Chloroplasts (photosynthesis) and a cell wall."),
      createCard("bi_10", "What is Active vs Passive Transport across cell membranes?", "Active transport moves substances against their concentration gradient and requires cellular energy (ATP). Passive transport moves substances down their gradient without energy.", "Active: Sodium-potassium pump. Passive: Diffusion, Osmosis."),
      createCard("bi_11", "What is the role of Enzymes in metabolic pathways?", "Enzymes act as biological catalysts, dramatically speeding up chemical reactions by lowering the activation energy barrier.", "Enzymes remain completely unchanged after a chemical reaction."),
      createCard("bi_12", "Define Homeostasis.", "The state of steady internal, physical, and chemical conditions maintained by living systems, regardless of changes in outer env.", "Controls core registers like body temperature, blood pH, and glucose concentrations."),
      createCard("bi_13", "Explain the difference between Prokaryotes and Eukaryotes.", "Prokaryotes lack a distinct membrane-bound nucleus and organelles (e.g. bacteria). Eukaryotes have a true nucleus enclosing DNA and membrane organelles (e.g. plants, animals).", "Eukaryotes are structurally much larger and more complex."),
      createCard("bi_14", "What is cell theory?", "A scientific theory asserting that all living things are composed of cells, the cell is the basic structural and functional unit of life, and all cells come from pre-existing cells.", "The foundation of modern biology."),
      createCard("bi_15", "Define Osmosis.", "The passive diffusion of water molecules through a selectively permeable membrane from an area of higher water potential to lower water potential.", "Crucial for plant turgor pressure and animal blood cell stability."),
      createCard("bi_16", "What is cellular metabolism?", "The sum of all physical and chemical processes in an organism by which material is produced, maintained, and energy made available.", "Divided into anabolism (building up) and catabolism (breaking down)."),
      createCard("bi_17", "What are helper T cells in human biology?", "White blood cells that play an indispensable role in adaptive immunity, coordinating responses by activating other immune cells.", "Primary target of HIV, leading to AIDS if unchecked."),
      createCard("bi_18", "Define biodiversity.", "The spatial and systemic variety of life on Earth, encompassing genetic diversity, ecosystem diversity, and species diversity.", "Ethiopia is famous for being a hotspot of biodiversity (e.g., endemic gelada baboons, walia ibex)."),
      createCard("bi_19", "What is fermentation?", "An anaerobic pathway that breaks down glucose to produce ATP in the absence of oxygen, generating lactic acid or ethanol as byproducts.", "Used in traditional Ethiopian injera batter fermentation via wild yeasts (ersho)."),
      createCard("bi_20", "What is the function of Lysosomes?", "Acidic membrane-bound vesicles containing digestive enzymes that break down waste materials, worn-out organelles, and foreign invaders.", "Referred to as the 'garbage disposal' of the animal cell.")
    ]
  },
  {
    id: "deck_english",
    title: "English Grammar",
    subject: "Communicative English",
    cards: [
      createCard("eg_1", "What are the rules for turning Direct Speech into Reported Speech?", "Shift tenses back (Present -> Past, Past -> Past Perfect), adjust pronouns (I -> he/she), and update time markers (today -> that day, yesterday -> the day before).", "Example: 'I am studying' becomes 'He said he was studying'."),
      createCard("eg_2", "Explain defining vs. non-defining Relative Clauses.", "Defining clauses give essential information to identify a noun (uses 'who' or 'which/that' without commas). Non-defining clauses offer extra, optional detail (uses commas, cannot use 'that').", "Defining: 'The student who scored A got the medal.' Non-defining: 'Abebe, who loves biology, won the medal.'"),
      createCard("eg_3", "Contrast 'must (obligation)' with 'should (advice)'.", "Must indicates a strict, administrative, or personal necessity / rule. Should is used to provide recommendations, opinions, or advice.", "Must: 'Students must register by Wednesday.' Should: 'You should study biology notes first.'"),
      createCard("eg_4", "How is a Passive Voice sentence formed?", "Move the object of the action to the subject position, add the auxiliary verb 'to be' in the matching tense, and join the main verb's Past Participle.", "Active: 'Tilahun wrote the essay.' Passive: 'The essay was written by Tilahun.'"),
      createCard("eg_5", "What is the structure of the Third Conditional?", "If + Past Perfect, would have + Past Participle. Highlights hypothetical situations in the past that did not happen.", "Example: 'If I had studied harder, I would have passed the final exam.'"),
      createCard("eg_6", "Identify the difference between 'since' and 'for' with Present Perfect.", "'Since' is used to specify a particular starting point in time. 'For' is used to measure a duration or block of time.", "Since: 'since 2018 / since July'. For: 'for 5 years / for 10 hours'."),
      createCard("eg_7", "What is a gerund vs. an infinitive?", "A gerund is a verb ending in '-ing' acting as a noun. An infinitive is the base form of a verb preceded by 'to'.", "Gerund: 'Studying is useful.' Infinitive: 'I want to study.' Some verbs only accept one or the other."),
      createCard("eg_8", "Define the Present Perfect Continuous.", "Used to show an action started in the past, continuing to the present moment, emphasizing the process.", "Active style: Subject + have/has + been + verb-ing. 'We have been discussing IoT for two hours.'"),
      createCard("eg_9", "Explain the use of 'used to' for past habits.", "Indicates actions or states that were repeated habits or true in the past but are no longer active in the present.", "Example: 'She used to teach economics, but now she works at the central bank.'"),
      createCard("eg_10", "What are modal verbs of deduction?", "'Must be' (100% sure true), 'Might/May/Could be' (possible but unsure), and 'Can't be' (100% sure impossible).", "Example: 'He scored 100 on the exam, he must be extremely smart.'"),
      createCard("eg_11", "Define active subject-verb agreement.", "Singular subjects require singular verbs, while plural subjects require plural verbs in the present tense.", "Example: 'The list of books is (not are) on the table.' 'Each student receives a card.'"),
      createCard("eg_12", "What is the difference between 'affect' and 'effect'?", "'Affect' is typically a verb meaning to influence. 'Effect' is typically a noun meaning the result or outcome.", "Example: 'The government spending cuts will affect (v) the GDP. The main effect (n) was inflation.'"),
      createCard("eg_13", "Define the First Conditional.", "If + Present Simple, will + base verb. Describes real and possible future situations.", "Example: 'If you complete the prep exam, you will score a top grade.'"),
      createCard("eg_14", "Define the Second Conditional.", "If + Past Simple, would + base verb. Standard structure for imaginary or hypothetical present/future states.", "Example: 'If I had a faster computer, I would run quantum models.' (Uses 'were' for all subjects in formal style: 'If I were you...')"),
      createCard("eg_15", "Explain the difference between 'few' and 'a few'.", "'Few' has a negative, restrictive connotation meaning 'scarcely any'. 'A few' has a positive connotation meaning 'some'.", "Few: 'There are few books, which is bad.' A few: 'There are a few books, which is enough to study.'"),
      createCard("eg_16", "What is a coordinating conjunction?", "Conjunctions used to connect words, phrases, or independent clauses of equal rank.", "Mnemonic: FANBOYS (For, And, Nor, But, Or, Yet, So)."),
      createCard("eg_17", "What is a dangling participle?", "An adjective modifier that is not logically or grammatically attached to the intended subject of the sentence.", "Example of error: 'Walking down the street, the leaf fell.' (The leaf wasn't walking!)"),
      createCard("eg_18", "What is the difference between transitive and intransitive verbs?", "Transitive verbs require a direct object to complete their meaning. Intransitive verbs do not take an object.", "Transitive: 'He bought teff.' Intransitive: 'She laughed.'"),
      createCard("eg_19", "Define the Past Perfect tense.", "Shows an action that was completed before another event in the past happened.", "Structure: had + past participle. 'Before the exam began, she had summarized the study notes.'"),
      createCard("eg_20", "What is a relative pronoun?", "A pronoun used to connect a clause or phrase to a noun or pronoun (who, whom, whose, which, that).", "Provides vital or non-vital qualifying info for the noun.")
    ]
  },
  {
    id: "deck_moral_civic",
    title: "Moral & Civic Education",
    subject: "Moral and Civic Education",
    cards: [
      createCard("mc_1", "What are the core pillars of the Ethiopian Constitution (1995)?", "Underpins key values: Sovereign power of nations, nationalities and peoples; supremacy of the constitution; protection of democratic rights; and federal structure.", "Composed of 106 articles. Drafted following the transitional period in December 1994."),
      createCard("mc_2", "Identify the three main categories of Human Rights.", "Civil and political rights (first-generation), economic, social and cultural rights (second-generation), and solidarity/collective rights (third-generation).", "Broadly protected under Chapter Three of the Ethiopian Constitution."),
      createCard("mc_3", "Name the major stages of Democratization.", "Transition (collapse of authoritarian regime), Consolidation (stable democratic institutions take root), and Deepening (democratic norms are fully integrated into civic society).", "Requires active voter lists, local rule of law, and free media infrastructure."),
      createCard("mc_4", "Explain Federalism, detailing symmetric vs asymmetric types.", "Federalism is a system where power is divided between a central government and regional constituent units. Symmetric federalism gives identical powers to all regions. Asymmetric federalism gives specific extra powers or protections to certain states.", "Ethiopia is a prominent example of multinational (ethnic) federalism with 11+ regional states."),
      createCard("mc_5", "What is the difference between civic duties and civic rights?", "Civic rights are protections and freedoms guaranteed to citizens by law (e.g. freedom of assembly). Civic duties are responsibilities citizens are expected to perform (e.g. paying taxes, obeying laws).", "A balanced society requires citizens to respect both rights and duties."),
      createCard("mc_6", "Explain Utilitarianism (ethical theory).", "The consequentialist theory that the morally right action is the one that produces the greatest amount of good / happiness for the greatest number of people.", "Associated with Jeremy Bentham and John Stuart Mill."),
      createCard("mc_7", "Explain Deontology / Kantian ethics.", "The duty-based ethical theory asserting that actions are inherently right or wrong, regardless of their consequences, based on universal moral laws (Categorical Imperative).", "Formulated by Immanuel Kant."),
      createCard("mc_8", "Explain Virtue Ethics.", "An ethical approach that emphasizes an individual's character and virtues (like honesty, courage, compassion) rather than rules or consequences as the foundation for ethical behaviour.", "Traces back to Aristotle."),
      createCard("mc_9", "Define Rule of Law.", "The principle that all people, institutions, and entities (including governments) are accountable to laws that are publicly promulgated, equally enforced, and independently adjudicated.", "No individual should be above the law in a democratic society."),
      createCard("mc_10", "What is political tolerance?", "The willingness to extend basic human rights, constitutional protections, and political freedoms to individuals and groups whose viewpoints, beliefs, and values differ from your own.", "Vital for the peaceful reconciliation of diverse communities in multinational states."),
      createCard("mc_11", "Define pluralism.", "A condition or system in which two or more states, groups, principles, or sources of authority coexist and have a voice, preventing monolithic administrative capture.", "Underpins robust, multi-perspective democratic discourse."),
      createCard("mc_12", "What is active civic participation?", "The active involvement of citizens in public life, community decision-making, voting, and civic organizations to influence local and national governance.", "Goes beyond simple voting to include grassroots organizing."),
      createCard("mc_13", "What is the legislative, executive, and judicial separation of powers?", "Legislative branch makes laws (parliament), Executive enforces laws (prime minister, cabinet), and Judicial interprets laws (Supreme Court).", "In Ethiopia, the HPR (House of Peoples' Representatives) serves as the primary legislative body."),
      createCard("mc_14", "What are traditional dispute resolution mechanisms in Ethiopia?", "Indigenous systems used by various ethnic communities to resolve conflicts amicably without resorting to formal courts.", "Examples include the Gadaa system (Oromo), Shimgelina (Amhara/national), and custom councils (Gurage, Sidama)."),
      createCard("mc_15", "Define Patriotism.", "The emotional attachment and dedication of a citizen to their country, centered on values of social justice, collective growth, and peaceful coexistence.", "Should be constructive and promote unity in diversity."),
      createCard("mc_16", "What is administrative corruption?", "The abuse of public office and administrative power for private financial gain, nepotism, or cronyism.", "Subverts economic development and erodes state trust."),
      createCard("mc_17", "Identify a key feature of the House of Federation (HoF) in Ethiopia.", "It is the upper house of parliament, with the primary unique mandate to interpret the national constitution and resolve regional boundary dispute resolutions.", "Represents the diverse nations, nationalities, and peoples of Ethiopia."),
      createCard("mc_18", "What is environmental ethics?", "The branch of ethics that studies the moral relationship of human beings to, and also the value and moral status of, the environment and non-human contents.", "Particularly important for sustainability and agricultural survival in East Africa."),
      createCard("mc_19", "Define sovereignty.", "The supreme, absolute, and uncontrollable power by which an independent state is governed, free from external administrative mandate.", "In Ethiopia, sovereignty resides in the Nations, Nationalities and Peoples of Ethiopia according to Article 8."),
      createCard("mc_20", "Explain professional ethics.", "The specialized set of standards and codes of conduct that govern the behavior of individuals in fields like medicine, engineering, law, and education.", "Builds public confidence and keeps practitioners accountable for client safety.")
    ]
  }
];

export const PREBUILT_STUDY_NOTES: PrebuiltStudyNote[] = [
  {
    id: "note_et",
    subject: "Emerging Technologies",
    title: "Core Mechanics of IoT & Industry 4.0",
    intro: "Emerging Technologies represent the structural backbone of physical-digital convergence in modern civilization. The fundamental engine of this transformation is the Internet of Things (IoT), transforming simple nodes into smart interconnected objects.",
    definition: "The Internet of Things (IoT) is a widespread mesh of physical devices ('things') equipped with sensors, local chips, and network protocols to stream, aggregate, and act upon environmental data without human intervention.",
    explanation: "At the core of an IoT ecosystem are four functional steps:\n1. Sensors/Devices: Node sensors gather localized parameters (e.g., temperature changes, speed spikes, light levels).\n2. Connectivity: Data is streamed to cloud platforms via 5G, Wi-Fi, or LoRaWAN protocols.\n3. Data Processing: Analytical servers or edge models aggregate and analyze incoming telemetries of nodes.\n4. User Interface: Alarms are triggered, dashboards updated, or actuators automatically adjust operational loads.",
    diagram: "[Sensor Nodes] ---📡---> [Edge Gateways] ---☁️---> [Cloud Analytical Engine] ---> [Actuation / Alerts]",
    summaryTable: {
      header: ["Pillar Layer", "Core Function", "Primary Standard / Protocol"],
      rows: [
        ["Perception Layer", "Gathers physical variables via hardware setups", "Sensors, RFID, GPS modules"],
        ["Network Layer", "Streams raw records to analytical hosts", "5G, Wi-Fi, MQTT, CoAP"],
        ["Support Layer", "Processes, aggregates, and organizes datasets", "Cloud compute, database clustering"],
        ["Application Layer", "Exposes actionable controls to end-users", "Dashboards, automated switches, APIs"]
      ]
    },
    mnemonics: "Remember 'P-N-S-A' to map out the IoT layers from physical ground to browser screen: Perception, Network, Support, Application.",
    color: "amber"
  },
  {
    id: "note_ec",
    subject: "Introduction to Economics",
    title: "The Law of Demand, Supply & Market Equilibrium",
    intro: "Economics is fundamentally the study of structural choices in a world of limited resources. Understanding how market prices reach their baseline balances is key to evaluating macro policies.",
    definition: "Market Equilibrium is the specific price-point where the quantity demanded by consumers exactly matches the quantity supplied by producers, eliminating local deficits and surpluses.",
    explanation: "The demand-supply cycle behaves as follows:\n- Law of Demand: Ceteris paribus, price and quantity demanded maintain an inverse relationship (downward sloping curve).\n- Law of Supply: Ceteris paribus, price and quantity supplied maintain a positive correlation (upward sloping curve).\n- Shifting forces: While a price change moves molecules *along* the curve, changes in variables like consumer tastes, input costs, and raw materials *shift* the entire curve, establishing a new equilibrium.",
    diagram: " Price 💰|\n   P*  | \`'--.  /  <- Supply (S)\n       |     X\n       |    / \`'--. <- Demand (D)\n       +-------------\n            Q*      Quantity 📦",
    summaryTable: {
      header: ["Market State", "Price Context", "Immediate Effect", "Economic Resolution"],
      rows: [
        ["Surplus", "Price is set above equilibrium", "Quantity supplied exceeds demanded", "Producers lower prices to clear excess inventory"],
        ["Shortage", "Price is set below equilibrium", "Quantity demanded exceeds supplied", "Consumers bid up prices, boosting factory volumes"],
        ["Equilibrium", "Price is set exactly at intersection", "Demand equals supply perfectly", "Market is cleared; price remains stable"]
      ]
    },
    mnemonics: "When thinking of shifts: Left leaves demand/supply LESS (decreases). Right represents MORE (increases).",
    color: "blue"
  },
  {
    id: "note_bi",
    subject: "General Biology",
    title: "Understanding Photosynthesis Energy Pathways",
    intro: "All organic energetic currencies derive from biological carbon fixation. Photosynthesis is the primary bridge converting solar radiation into chemical energy locked in sugar structures.",
    definition: "Photosynthesis is the metabolic pathway by which plants, algae, and some bacteria synthesize high-energy glucose molecules from carbon dioxide and water using light radiation as the activation engine.",
    explanation: "Photosynthesis is neatly divided into two distinct metabolic stages:\n1. Light-Dependent Reactions: Occur inside the thylakoid membranes of chloroplasts. Sunlight splits water molecules (photolysis), liberating oxygen waste, and charging electrons to synthesize ATP and NADPH.\n2. Light-Independent Reactions / Calvin Cycle: Takes place within the chloroplast stroma. Does not need direct light. Uses the synthesized ATP and NADPH from stage 1 to fix carbon dioxide into three-carbon sugars, eventually generating organic glucose.",
    diagram: "  [Sunlight] + [Water] 💧 ---> (Thylakoids: Light Rx) ---> [ATP + NADPH] ---> (Stroma: Calvin Cycle) -> [Glucose] 🍭\n                                    ↓                                           ↑\n                               [Oxygen] 🌬️                                  [CO2] 💨",
    summaryTable: {
      header: ["Process Phase", "Spatial Location", "Crucial Input Parameters", "Resulting End Products"],
      rows: [
        ["Light Reactions", "Thylakoid membranes", "Sunlight, H2O, NADP+, ADP", "Oxygen, ATP, NADPH"],
        ["Calvin Cycle", "Chloroplast stroma", "Carbon dioxide, ATP, NADPH", "G3P Sugars, NADP+, ADP"]
      ]
    },
    mnemonics: "Remember: 'L-ig-h-t' yields O2 in Thylakoids, 'C-a-l-v-i-n' cooks CO2 into Glucose in Stroma.",
    color: "emerald"
  },
  {
    id: "note_eg",
    subject: "Communicative English",
    title: "Reported Speech & Conditional Clauses Matrix",
    intro: "Advanced communication in English requires systematic mastery of reported speech formatting and conditional truth tables.",
    definition: "Reported Speech (Indirect Speech) is the linguistic system of conveying what someone said without writing their exact literal words, requiring systematic backshifts of tenses, pronouns, and time-markers.",
    explanation: "Two core structural rules to study for national exams:\n\n1. Reported Speech Tense Backshifts:\n- Simple Present -> Simple Past ('I study' -> 'He said he studied')\n- Present Continuous -> Past Continuous ('I am studying' -> 'She said she was studying')\n- Simple Past / Present Perfect -> Past Perfect ('I studied' -> 'He said he had studied')\n\n2. Conditional Clauses Matrix:\n- Zero Conditional: Facts and absolute truths. [If + Present, Present]\n- First Conditional: Real, highly possible futures. [If + Present, Will + Verb]\n- Second Conditional: Imaginary or highly hypothetical situations. [If + Past, Would + Verb]\n- Third Conditional: Unchangeable past regrets or hypothetical history. [If + Past Perfect, Would Have + Past Participle]",
    diagram: "[Direct Speech] --- (Backshift Tense + Shift Pronoun) ---> [Reported Speech Form]",
    summaryTable: {
      header: ["Direct Time Phrase", "Reported Counterpart", "Direct Verb Tense", "Reported Verb Tense"],
      rows: [
        ["today", "that day", "is studying", "was studying"],
        ["tomorrow", "the next day", "completed", "had completed"],
        ["yesterday", "the day before", "will study", "would study"]
      ]
    },
    mnemonics: "When reporting from the past: move one tense back in time. Present goes past; simple past slips into past perfect.",
    color: "indigo"
  },
  {
    id: "note_mc",
    subject: "Moral and Civic Education",
    title: "The Ethiopian Constitutional System & Civic Duties",
    intro: "Civic education builds responsible, knowledgeable community leaders. The ultimate framework guiding civic engagement in Ethiopia is the national constitution, detailing state structures and citizen duties.",
    definition: "Human Rights are fundamental, inalienable moral claims which all individuals possess by virtue of their common humanity, recognized and protected legally under the supreme rule of law.",
    explanation: "The Constitutional Federal System of Ethiopia (1995 Federal Constitution):\n- Sovereign Authority: Article 8 vests all state sovereignty in the Nations, Nationalities and Peoples of Ethiopia.\n- Separation of Duties: Governed under the Trias Politica, split between: HPR (legislative Hanes), Prime Minister (Executive command), and the Federal Courts (Judiciary checks).\n- Regional Autonomy: Under geographic structural federalism, regions manage local budgets, maintain native languages, and run state assemblies while respecting federal parameters.",
    diagram: "           [FEDERAL CONSTITUTION] (Supreme Law)\n                     /\n     +---------------+------------+ \n     ↓                            ↓\n [Human Rights] (Article 14-28)   [Democratic Rights] (Article 29-44)",
    summaryTable: {
      header: ["Constitutional Chapter", "Core Articles Covered", "Major Guarantee / Standard", "Practical Citizen Effect"],
      rows: [
        ["Chapter One", "Articles 1 - 7", "Nomenclature, state shape, secular status", "Specifies federalism limits"],
        ["Chapter Two", "Articles 8 - 12", "Sovereignty of peoples, rule of law", "Guarantees public accountability"],
        ["Chapter Three", "Articles 14 - 44", "Human Rights & Democratic Rights", "Protects free speech and assembly"]
      ]
    },
    mnemonics: "Think of Chapters One, Two, and Three as defining: Our State Identity, Our Sovereign Trust, and Our Inalienable Human Freedoms.",
    color: "rose"
  }
];
