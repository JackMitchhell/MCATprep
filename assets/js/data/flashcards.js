/* flashcards.js — seed deck of high-yield MCAT flashcards.
   Users can add their own cards (stored separately in Store.customCards). */
(function () {
  const C = (id, section, topic, front, back) => ({ id, section, topic, front, back });

  const SEED = [
    // Chem / Phys
    C("s-cp-1", "cp", "Acids/Bases", "Henderson–Hasselbalch equation?", "pH = pKa + log([A⁻]/[HA]). At the buffer's pKa, [A⁻] = [HA] and pH = pKa."),
    C("s-cp-2", "cp", "Thermo", "When is a reaction spontaneous (ΔG)?", "ΔG < 0. ΔG = ΔH − TΔS. Spontaneous if ΔH<0 & ΔS>0 always; otherwise temperature-dependent."),
    C("s-cp-3", "cp", "Kinetics", "What does a catalyst change — and not change?", "Lowers activation energy (speeds both forward & reverse equally). Does NOT change ΔG, ΔH, Keq, or equilibrium position."),
    C("s-cp-4", "cp", "Physics", "Bernoulli's principle (intuition)?", "In ideal fluid flow, higher velocity ↔ lower pressure. Energy per volume conserved: P + ½ρv² + ρgh = constant."),
    C("s-cp-5", "cp", "Physics", "Ohm's law and power?", "V = IR. Power P = IV = I²R = V²/R."),
    C("s-cp-6", "cp", "Gen Chem", "Periodic trends: electronegativity & atomic radius?", "Electronegativity ↑ up and to the right. Atomic radius ↑ down and to the left."),
    C("s-cp-7", "cp", "Electrochem", "Oxidation vs reduction & where they occur?", "Oxidation Is Loss of e⁻ (anode); Reduction Is Gain (cathode). 'An Ox, Red Cat.'"),
    C("s-cp-8", "cp", "Orgo", "SN1 vs SN2 key differences?", "SN1: 2-step, carbocation intermediate, favors 3°, racemization, weak nucleophile/polar protic. SN2: 1-step, backside attack/inversion, favors 1°, strong nucleophile/polar aprotic."),

    // Bio / Biochem
    C("s-bb-1", "bb", "Metabolism", "Net ATP from glycolysis?", "2 ATP (net), 2 NADH, 2 pyruvate per glucose. (4 made − 2 invested.)"),
    C("s-bb-2", "bb", "Metabolism", "Where does the electron transport chain occur & final e⁻ acceptor?", "Inner mitochondrial membrane; final electron acceptor is O₂ (forms water). Drives ATP synthase via proton gradient."),
    C("s-bb-3", "bb", "Enzymes", "Competitive vs noncompetitive inhibition on Km/Vmax?", "Competitive: Km ↑, Vmax unchanged (outcompeted by substrate). Noncompetitive: Km unchanged, Vmax ↓."),
    C("s-bb-4", "bb", "Amino Acids", "Which amino acids are acidic / basic?", "Acidic: Aspartate, Glutamate. Basic: Lysine, Arginine, Histidine."),
    C("s-bb-5", "bb", "Genetics", "Central dogma steps & enzymes?", "DNA →(replication, DNA pol)→ DNA →(transcription, RNA pol)→ mRNA →(translation, ribosome)→ protein."),
    C("s-bb-6", "bb", "Physiology", "Action potential phases?", "Resting (−70mV) → depolarization (Na⁺ in) → repolarization (K⁺ out) → hyperpolarization → return to rest. All-or-none."),
    C("s-bb-7", "bb", "Renal", "Function of the loop of Henle?", "Descending limb: permeable to water (water leaves). Ascending limb: pumps out Na⁺/K⁺/Cl⁻, impermeable to water. Creates medullary osmotic gradient."),
    C("s-bb-8", "bb", "Endocrine", "Insulin vs glucagon?", "Insulin (β-cells): lowers blood glucose, promotes storage. Glucagon (α-cells): raises blood glucose, promotes glycogenolysis/gluconeogenesis."),

    // Psych / Soc
    C("s-ps-1", "ps", "Conditioning", "Classical vs operant conditioning?", "Classical: involuntary response paired with stimulus (Pavlov). Operant: voluntary behavior shaped by consequences/reinforcement (Skinner)."),
    C("s-ps-2", "ps", "Reinforcement", "Which reinforcement schedule is most resistant to extinction?", "Variable ratio (e.g., gambling) — unpredictable number of responses per reward."),
    C("s-ps-3", "ps", "Memory", "Difference: proactive vs retroactive interference?", "Proactive: OLD info interferes with NEW. Retroactive: NEW info interferes with OLD."),
    C("s-ps-4", "ps", "Development", "Piaget's four stages?", "Sensorimotor (0–2, object permanence), Preoperational (2–7, egocentrism), Concrete operational (7–11, conservation), Formal operational (11+, abstract)."),
    C("s-ps-5", "ps", "Sociology", "Three major sociological paradigms?", "Functionalism (society as interrelated parts), Conflict theory (competition over resources/power), Symbolic interactionism (micro-level shared meanings)."),
    C("s-ps-6", "ps", "Social Psych", "Fundamental attribution error?", "Overemphasizing dispositional (personality) causes and underemphasizing situational causes for others' behavior."),
    C("s-ps-7", "ps", "Emotion", "James–Lange vs Cannon–Bard vs Schachter–Singer?", "James–Lange: physiology → emotion. Cannon–Bard: physiology & emotion simultaneously. Schachter–Singer: physiology + cognitive label → emotion."),
    C("s-ps-8", "ps", "Disorders", "Positive vs negative symptoms of schizophrenia?", "Positive: ADD to behavior (hallucinations, delusions). Negative: REMOVE from behavior (flat affect, avolition, anhedonia)."),

    // CARS (skill prompts rather than facts)
    C("s-cars-1", "cars", "Strategy", "First move when a CARS question asks what the author would 'most likely agree with'?", "Return to the author's main argument/tone. Eliminate answers that contradict the author's stance or overreach beyond the passage's scope."),
    C("s-cars-2", "cars", "Strategy", "Trap answer pattern: extreme language?", "Words like 'always', 'never', 'all', 'only' are usually too strong for humanities passages. Favor moderate, qualified answers unless the author is explicitly absolute.")
  ];

  window.FlashcardSeed = SEED;
})();
