/* curriculum.js — MCAT content map organized by the four AAMC sections.
   Each topic carries curated FREE resources (Khan Academy, YouTube channels,
   Jack Westin, AAMC). YouTube links use targeted search queries so they stay
   valid over time and surface the best current free videos. */
(function () {
  const yt = (q) => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);
  const ka = (path) => "https://www.khanacademy.org/test-prep/mcat" + (path || "");

  // Reusable channel references (all free).
  const CHANNELS = {
    khan: { name: "Khan Academy MCAT", url: "https://www.youtube.com/@khanacademymedicine", note: "Full official-aligned MCAT collection" },
    ak: { name: "AK Lectures", url: "https://www.youtube.com/@AKLECTURES", note: "Deep biochem, biology & chemistry" },
    dave: { name: "Professor Dave Explains", url: "https://www.youtube.com/@ProfessorDaveExplains", note: "Chemistry, biology, physics fundamentals" },
    octutor: { name: "The Organic Chemistry Tutor", url: "https://www.youtube.com/@TheOrganicChemistryTutor", note: "Physics, gen chem, orgo problem-solving" },
    crash: { name: "CrashCourse", url: "https://www.youtube.com/@crashcourse", note: "Psychology, A&P, biology, orgo series" },
    msc: { name: "MedSchoolCoach MCAT", url: "https://www.youtube.com/@MedSchoolCoachMCAT", note: "MCAT-specific strategy & content" },
    jw: { name: "Jack Westin", url: "https://www.youtube.com/@JackWestin", note: "CARS strategy & passages" }
  };

  const SECTIONS = [
    {
      id: "cp",
      short: "C/P",
      name: "Chemical & Physical Foundations",
      color: "cp",
      weight: 25,
      blurb: "General chemistry, physics, organic chemistry, and biochemistry as they apply to living systems.",
      units: [
        {
          name: "General Chemistry",
          topics: [
            { id: "cp-atomic", name: "Atomic structure & periodic trends", hours: 2, res: [
              { t: "Khan Academy: Atomic structure", u: ka("/physical-processes/atomic-nucleus") },
              { t: "Periodic trends (video)", u: yt("MCAT periodic trends electronegativity ionization energy") } ] },
            { id: "cp-bonding", name: "Bonding & molecular structure", hours: 2, res: [
              { t: "Bonding & hybridization", u: yt("MCAT chemical bonding hybridization") } ] },
            { id: "cp-stoich", name: "Stoichiometry & solutions", hours: 2, res: [
              { t: "Stoichiometry crash", u: yt("MCAT stoichiometry solutions molarity") } ] },
            { id: "cp-thermo", name: "Thermochemistry & thermodynamics", hours: 3, res: [
              { t: "Gibbs free energy & enthalpy", u: yt("MCAT thermodynamics gibbs free energy enthalpy entropy") } ] },
            { id: "cp-kinetics", name: "Kinetics & equilibrium", hours: 3, res: [
              { t: "Rate laws & Le Chatelier", u: yt("MCAT kinetics equilibrium rate law le chatelier") } ] },
            { id: "cp-acidbase", name: "Acids, bases & buffers", hours: 3, res: [
              { t: "pH, pKa & buffers", u: yt("MCAT acids bases buffers henderson hasselbalch") } ] },
            { id: "cp-electro", name: "Electrochemistry", hours: 2, res: [
              { t: "Galvanic & electrolytic cells", u: yt("MCAT electrochemistry galvanic cells nernst") } ] },
            { id: "cp-gases", name: "Gas phase & kinetic molecular theory", hours: 2, res: [
              { t: "Ideal & real gases", u: yt("MCAT gases ideal gas law kinetic molecular theory partial pressure") } ] }
          ]
        },
        {
          name: "Physics",
          topics: [
            { id: "cp-kinematics", name: "Kinematics & forces", hours: 3, res: [
              { t: "Newtonian mechanics", u: yt("MCAT physics kinematics forces newton") } ] },
            { id: "cp-energy", name: "Work, energy & momentum", hours: 2, res: [
              { t: "Energy & momentum", u: yt("MCAT physics work energy momentum") } ] },
            { id: "cp-fluids", name: "Fluids & gases", hours: 3, res: [
              { t: "Fluid dynamics for MCAT", u: yt("MCAT fluids bernoulli poiseuille continuity") } ] },
            { id: "cp-circuits", name: "Electricity & magnetism / circuits", hours: 3, res: [
              { t: "Circuits & Ohm's law", u: yt("MCAT circuits ohms law capacitors") } ] },
            { id: "cp-waves", name: "Waves, sound & optics", hours: 3, res: [
              { t: "Waves, sound & light", u: yt("MCAT waves sound optics lenses") } ] },
            { id: "cp-thermophys", name: "Thermodynamics (physics) & heat", hours: 2, res: [
              { t: "Heat transfer & gas laws", u: yt("MCAT thermodynamics physics heat ideal gas") } ] },
            { id: "cp-atomicphys", name: "Atomic & nuclear phenomena (light, quantum, decay)", hours: 2, res: [
              { t: "Light, photoelectric effect & quanta", u: yt("MCAT light photoelectric effect quantum atomic spectra") },
              { t: "Nuclear chemistry & radioactive decay", u: yt("MCAT nuclear chemistry radioactive decay half life") } ] }
          ]
        },
        {
          name: "Organic & Lab Techniques",
          topics: [
            { id: "cp-orgo-fg", name: "Functional groups & nomenclature", hours: 2, res: [
              { t: "Functional groups review", u: yt("MCAT organic chemistry functional groups reactions") } ] },
            { id: "cp-orgo-rxn", name: "Key reactions & mechanisms", hours: 3, res: [
              { t: "MCAT orgo reactions", u: yt("MCAT organic chemistry reactions mechanisms") } ] },
            { id: "cp-spectro", name: "Separations & spectroscopy", hours: 3, res: [
              { t: "IR, NMR, chromatography", u: yt("MCAT spectroscopy IR NMR chromatography") } ] },
            { id: "cp-analytical", name: "Lab techniques & analytical chem", hours: 2, res: [
              { t: "Lab methods", u: yt("MCAT lab techniques separation purification") } ] }
          ]
        }
      ]
    },
    {
      id: "cars",
      short: "CARS",
      name: "Critical Analysis & Reasoning Skills",
      color: "cars",
      weight: 25,
      blurb: "No content to memorize — pure reading comprehension and reasoning. The single highest-yield daily habit: practice passages every day.",
      units: [
        {
          name: "Strategy & Daily Practice",
          topics: [
            { id: "cars-foundations", name: "CARS foundations & question types", hours: 2, res: [
              { t: "CARS strategy overview", u: yt("MCAT CARS strategy question types") },
              { t: "Jack Westin free CARS passages", u: "https://jackwestin.com/resources/cars" } ] },
            { id: "cars-skimming", name: "Active reading & passage mapping", hours: 1, res: [
              { t: "How to read CARS passages", u: yt("MCAT CARS active reading highlighting strategy") } ] },
            { id: "cars-inference", name: "Inference & main-idea questions", hours: 1, res: [
              { t: "Inference questions", u: yt("MCAT CARS inference main idea questions") } ] },
            { id: "cars-reasoning", name: "Reasoning beyond the text", hours: 1, res: [
              { t: "Apply / strengthen / weaken", u: yt("MCAT CARS reasoning beyond text apply strengthen weaken") } ] },
            { id: "cars-timing", name: "Timing & elimination tactics", hours: 1, res: [
              { t: "CARS timing strategy", u: yt("MCAT CARS timing pacing elimination") } ] },
            { id: "cars-daily", name: "Daily CARS passage set (2–3 passages)", hours: 1, recurring: true, res: [
              { t: "Jack Westin daily passages", u: "https://jackwestin.com/resources/cars" },
              { t: "AAMC CARS Question Pack", u: "https://store.aamc.org/" } ] }
          ]
        }
      ]
    },
    {
      id: "bb",
      short: "B/B",
      name: "Biological & Biochemical Foundations",
      color: "bb",
      weight: 25,
      blurb: "Biology, biochemistry, and the molecular and cellular basis of living systems — the largest body of pure content.",
      units: [
        {
          name: "Biochemistry",
          topics: [
            { id: "bb-aa", name: "Amino acids & proteins", hours: 3, res: [
              { t: "Amino acids (must memorize)", u: yt("MCAT amino acids structures properties") },
              { t: "Protein structure", u: yt("MCAT protein structure folding") } ] },
            { id: "bb-enzymes", name: "Enzymes & kinetics", hours: 3, res: [
              { t: "Enzyme kinetics & inhibition", u: yt("MCAT enzyme kinetics michaelis menten inhibition") } ] },
            { id: "bb-metabolism", name: "Metabolism: glycolysis & respiration", hours: 4, res: [
              { t: "Glycolysis → Krebs → ETC", u: yt("MCAT metabolism glycolysis krebs electron transport chain") } ] },
            { id: "bb-lipids", name: "Lipids & lipid metabolism", hours: 2, res: [
              { t: "Lipid metabolism", u: yt("MCAT lipids fatty acid metabolism") } ] },
            { id: "bb-nucleic", name: "Nucleic acids & molecular genetics", hours: 3, res: [
              { t: "DNA/RNA & central dogma", u: yt("MCAT nucleic acids DNA replication transcription translation") } ] },
            { id: "bb-carbs", name: "Carbohydrates & alternative metabolism (glycogen, gluconeogenesis, PPP)", hours: 3, res: [
              { t: "Carbohydrate structure", u: yt("MCAT carbohydrates structure monosaccharides glycosidic") },
              { t: "Glycogen, gluconeogenesis & PPP", u: yt("MCAT glycogenesis gluconeogenesis pentose phosphate pathway") } ] },
            { id: "bb-biosignaling", name: "Cell signaling & second messengers", hours: 2, res: [
              { t: "Receptors & signal cascades", u: yt("MCAT cell signaling G protein second messenger cAMP receptors") } ] }
          ]
        },
        {
          name: "Cell & Molecular Biology",
          topics: [
            { id: "bb-cell", name: "Cell structure & organelles", hours: 2, res: [
              { t: "Cell biology", u: yt("MCAT cell structure organelles membrane transport") } ] },
            { id: "bb-membrane", name: "Membrane structure & transport", hours: 2, res: [
              { t: "Membranes & transport", u: yt("MCAT cell membrane structure passive active transport osmosis") } ] },
            { id: "bb-cellcycle", name: "Cell cycle, mitosis & meiosis", hours: 2, res: [
              { t: "Cell cycle & division", u: yt("MCAT cell cycle mitosis meiosis checkpoints cancer") } ] },
            { id: "bb-genetics", name: "Genetics & inheritance", hours: 3, res: [
              { t: "Mendelian & molecular genetics", u: yt("MCAT genetics inheritance punnett mutations") } ] },
            { id: "bb-evolution", name: "Evolution & population genetics (Hardy–Weinberg)", hours: 2, res: [
              { t: "Natural selection & Hardy–Weinberg", u: yt("MCAT evolution natural selection hardy weinberg population genetics") } ] },
            { id: "bb-biotech", name: "Molecular biology techniques (PCR, cloning, blotting)", hours: 2, res: [
              { t: "Biotech lab methods", u: yt("MCAT molecular biology techniques PCR gel electrophoresis cloning blotting") } ] },
            { id: "bb-micro", name: "Microbiology & viruses", hours: 2, res: [
              { t: "Bacteria & viruses", u: yt("MCAT microbiology bacteria viruses") } ] }
          ]
        },
        {
          name: "Physiology & Organ Systems",
          topics: [
            { id: "bb-nervous", name: "Nervous & endocrine systems", hours: 3, res: [
              { t: "Neurons & hormones", u: yt("MCAT nervous system action potential endocrine hormones") } ] },
            { id: "bb-cardio", name: "Cardiovascular & respiratory", hours: 3, res: [
              { t: "Heart & lungs physiology", u: yt("MCAT cardiovascular respiratory physiology") } ] },
            { id: "bb-renal", name: "Renal & digestive systems", hours: 3, res: [
              { t: "Kidney & GI physiology", u: yt("MCAT renal nephron digestive physiology") } ] },
            { id: "bb-immune", name: "Immune & lymphatic systems", hours: 2, res: [
              { t: "Immunology", u: yt("MCAT immune system innate adaptive immunity") } ] },
            { id: "bb-repro", name: "Reproductive & development", hours: 2, res: [
              { t: "Reproduction & development", u: yt("MCAT reproductive system embryology development") } ] },
            { id: "bb-musculo", name: "Musculoskeletal & skin", hours: 2, res: [
              { t: "Muscle & bone", u: yt("MCAT muscle contraction skeletal system") } ] }
          ]
        }
      ]
    },
    {
      id: "ps",
      short: "P/S",
      name: "Psychological, Social & Biological Foundations of Behavior",
      color: "ps",
      weight: 25,
      blurb: "Psychology and sociology — heavy on terminology and theorists. Flashcards are extremely high-yield here.",
      units: [
        {
          name: "Psychology",
          topics: [
            { id: "ps-sensation", name: "Sensation & perception", hours: 2, res: [
              { t: "Sensation & perception", u: yt("MCAT sensation perception psychophysics") } ] },
            { id: "ps-cognition", name: "Cognition, memory & intelligence", hours: 3, res: [
              { t: "Memory & cognition", u: yt("MCAT cognition memory models intelligence") } ] },
            { id: "ps-learning", name: "Learning & conditioning", hours: 2, res: [
              { t: "Classical & operant conditioning", u: yt("MCAT learning classical operant conditioning") } ] },
            { id: "ps-motivation", name: "Motivation, emotion & stress", hours: 2, res: [
              { t: "Motivation & emotion theories", u: yt("MCAT motivation emotion theories stress") } ] },
            { id: "ps-development", name: "Development & personality", hours: 3, res: [
              { t: "Developmental & personality theories", u: yt("MCAT development personality freud erikson piaget") } ] },
            { id: "ps-disorders", name: "Psychological disorders", hours: 2, res: [
              { t: "Psych disorders & treatment", u: yt("MCAT psychological disorders DSM treatment") } ] },
            { id: "ps-biological", name: "Biological bases of behavior (brain & neurotransmitters)", hours: 3, res: [
              { t: "Brain regions & their functions", u: yt("MCAT biological basis of behavior brain regions") },
              { t: "Neurotransmitters in behavior", u: yt("MCAT neurotransmitters functions behavior dopamine serotonin") } ] },
            { id: "ps-consciousness", name: "Consciousness, sleep & drug states", hours: 2, res: [
              { t: "States of consciousness", u: yt("MCAT consciousness sleep stages dreaming psychoactive drugs") } ] },
            { id: "ps-identity", name: "Identity & the self", hours: 2, res: [
              { t: "Self-concept & identity formation", u: yt("MCAT self identity self concept self esteem formation") } ] },
            { id: "ps-attitudes", name: "Attitudes & behavior change (persuasion, dissonance)", hours: 2, res: [
              { t: "Attitudes & persuasion", u: yt("MCAT attitudes behavior change cognitive dissonance persuasion elaboration likelihood") } ] }
          ]
        },
        {
          name: "Sociology",
          topics: [
            { id: "ps-soctheory", name: "Sociological theories & frameworks", hours: 2, res: [
              { t: "Functionalism, conflict, symbolic interaction", u: yt("MCAT sociology theories functionalism conflict symbolic interactionism") } ] },
            { id: "ps-socialstructure", name: "Social structure & institutions", hours: 2, res: [
              { t: "Social institutions", u: yt("MCAT social structure institutions") } ] },
            { id: "ps-groups", name: "Social interaction & group behavior", hours: 2, res: [
              { t: "Group dynamics & self-presentation", u: yt("MCAT social psychology group behavior attribution") } ] },
            { id: "ps-demographics", name: "Demographics & social change", hours: 2, res: [
              { t: "Demographics & urbanization", u: yt("MCAT demographics social change urbanization") } ] },
            { id: "ps-inequality", name: "Social inequality & stratification", hours: 2, res: [
              { t: "Inequality & health disparities", u: yt("MCAT social inequality stratification health disparities") } ] },
            { id: "ps-culture", name: "Culture & socialization", hours: 2, res: [
              { t: "Culture, norms & socialization", u: yt("MCAT culture socialization norms values material symbolic") } ] },
            { id: "ps-health", name: "Medical sociology & healthcare disparities", hours: 2, res: [
              { t: "Medicine as a social institution", u: yt("MCAT medical sociology sick role healthcare access disparities") } ] }
          ]
        }
      ]
    }
  ];

  // Flatten helpers
  function allTopics() {
    const list = [];
    SECTIONS.forEach((s) =>
      s.units.forEach((u) =>
        u.topics.forEach((t) => list.push(Object.assign({ section: s.id, sectionName: s.name, unit: u.name }, t)))
      )
    );
    return list;
  }
  function sectionById(id) { return SECTIONS.find((s) => s.id === id); }
  function topicById(id) { return allTopics().find((t) => t.id === id); }

  window.Curriculum = { SECTIONS, CHANNELS, allTopics, sectionById, topicById, yt };
})();
