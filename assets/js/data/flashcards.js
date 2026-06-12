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
    C("s-cp-9", "cp", "Gases", "Ideal gas law & when do real gases deviate?", "PV = nRT. Assumes no intermolecular forces and negligible molecular volume. Deviations are largest at high pressure & low temperature."),
    C("s-cp-10", "cp", "Gases", "Dalton's law — find a gas's partial pressure?", "P_total = ΣP_i. A component's partial pressure P_i = X_i × P_total (mole fraction × total pressure)."),
    C("s-cp-11", "cp", "Nuclear", "Alpha vs beta⁻ vs gamma decay?", "Alpha: emits He nucleus (mass −4, atomic # −2). Beta⁻: neutron→proton + e⁻ (atomic # +1, mass ~same). Gamma: high-energy photon, no change in mass/number."),
    C("s-cp-12", "cp", "Nuclear", "After 3 half-lives, what fraction remains?", "Fraction remaining = (½)ⁿ. After 3 half-lives → 1/8 of the original sample remains."),
    C("s-cp-13", "cp", "Atomic", "Photoelectric effect — key takeaway?", "Light above a threshold frequency ejects electrons; ejected-electron KE depends on frequency, not intensity. Evidence that light is quantized (photons), E = hf."),
    C("s-cp-14", "cp", "Optics", "Real vs virtual image (sign of image distance)?", "Positive image distance = real & inverted (for lenses, opposite side). Negative = virtual & upright (same side). Converging lens/mirror: f > 0."),

    // Bio / Biochem
    C("s-bb-1", "bb", "Metabolism", "Net ATP from glycolysis?", "2 ATP (net), 2 NADH, 2 pyruvate per glucose. (4 made − 2 invested.)"),
    C("s-bb-2", "bb", "Metabolism", "Where does the electron transport chain occur & final e⁻ acceptor?", "Inner mitochondrial membrane; final electron acceptor is O₂ (forms water). Drives ATP synthase via proton gradient."),
    C("s-bb-3", "bb", "Enzymes", "Competitive vs noncompetitive inhibition on Km/Vmax?", "Competitive: Km ↑, Vmax unchanged (outcompeted by substrate). Noncompetitive: Km unchanged, Vmax ↓."),
    C("s-bb-4", "bb", "Amino Acids", "Which amino acids are acidic / basic?", "Acidic: Aspartate, Glutamate. Basic: Lysine, Arginine, Histidine."),
    C("s-bb-5", "bb", "Genetics", "Central dogma steps & enzymes?", "DNA →(replication, DNA pol)→ DNA →(transcription, RNA pol)→ mRNA →(translation, ribosome)→ protein."),
    C("s-bb-6", "bb", "Physiology", "Action potential phases?", "Resting (−70mV) → depolarization (Na⁺ in) → repolarization (K⁺ out) → hyperpolarization → return to rest. All-or-none."),
    C("s-bb-7", "bb", "Renal", "Function of the loop of Henle?", "Descending limb: permeable to water (water leaves). Ascending limb: pumps out Na⁺/K⁺/Cl⁻, impermeable to water. Creates medullary osmotic gradient."),
    C("s-bb-8", "bb", "Endocrine", "Insulin vs glucagon?", "Insulin (β-cells): lowers blood glucose, promotes storage. Glucagon (α-cells): raises blood glucose, promotes glycogenolysis/gluconeogenesis."),
    C("s-bb-9", "bb", "Carbohydrates", "Products & purpose of the pentose phosphate pathway (PPP)?", "Makes NADPH (biosynthesis & antioxidant defense) and ribose-5-phosphate (for nucleotides). Occurs in the cytoplasm; no ATP made."),
    C("s-bb-10", "bb", "Carbohydrates", "Is gluconeogenesis just reverse glycolysis? Where?", "Mostly, but it bypasses glycolysis's 3 irreversible steps with different enzymes (PEP carboxykinase, fructose-1,6-bisphosphatase, glucose-6-phosphatase). Mainly in the liver."),
    C("s-bb-11", "bb", "Signaling", "Peptide vs steroid hormone signaling?", "Peptide: hydrophilic → bind surface receptors → second messengers (fast, short-lived). Steroid: hydrophobic → cross membrane → bind intracellular receptors → alter transcription (slow, long-lasting)."),
    C("s-bb-12", "bb", "Signaling", "Gs GPCR second-messenger cascade?", "Ligand→GPCR→Gs protein activates adenylyl cyclase→cAMP→protein kinase A. Each step amplifies the signal."),
    C("s-bb-13", "bb", "Membrane", "Primary vs secondary active transport?", "Primary: uses ATP directly (e.g., Na⁺/K⁺ ATPase). Secondary: harnesses an existing ion gradient (sym-/antiport, e.g., Na⁺–glucose cotransport). Both move solute against its gradient."),
    C("s-bb-14", "bb", "Cell Cycle", "Phases of the cell cycle?", "Interphase = G1 (growth) → S (DNA replication) → G2 (prep); then M (mitosis). G0 = resting. Major control at the G1/S restriction point."),
    C("s-bb-15", "bb", "Cell Cycle", "Mitosis vs meiosis outcome?", "Mitosis: 1 division → 2 identical diploid cells. Meiosis: 2 divisions → 4 genetically unique haploid gametes; variation from crossing over & independent assortment."),
    C("s-bb-16", "bb", "Biotech", "Three steps of PCR?", "Denaturation (~95°C, strands separate) → Annealing (~55°C, primers bind) → Extension (~72°C, Taq polymerase synthesizes). Repeated cycles amplify DNA exponentially."),
    C("s-bb-17", "bb", "Biotech", "Gel electrophoresis — direction & speed?", "DNA is negatively charged → migrates toward the positive electrode (anode). Smaller fragments move faster and travel farther."),
    C("s-bb-18", "bb", "Evolution", "Hardy–Weinberg equations & what q² means?", "p + q = 1 and p² + 2pq + q² = 1. q² = frequency of homozygous recessives, 2pq = heterozygotes, p² = homozygous dominants."),
    C("s-bb-19", "bb", "Evolution", "Five conditions for Hardy–Weinberg equilibrium?", "No mutation, no gene flow (migration), no natural selection, random mating, and a large population (no genetic drift)."),

    // Psych / Soc
    C("s-ps-1", "ps", "Conditioning", "Classical vs operant conditioning?", "Classical: involuntary response paired with stimulus (Pavlov). Operant: voluntary behavior shaped by consequences/reinforcement (Skinner)."),
    C("s-ps-2", "ps", "Reinforcement", "Which reinforcement schedule is most resistant to extinction?", "Variable ratio (e.g., gambling) — unpredictable number of responses per reward."),
    C("s-ps-3", "ps", "Memory", "Difference: proactive vs retroactive interference?", "Proactive: OLD info interferes with NEW. Retroactive: NEW info interferes with OLD."),
    C("s-ps-4", "ps", "Development", "Piaget's four stages?", "Sensorimotor (0–2, object permanence), Preoperational (2–7, egocentrism), Concrete operational (7–11, conservation), Formal operational (11+, abstract)."),
    C("s-ps-5", "ps", "Sociology", "Three major sociological paradigms?", "Functionalism (society as interrelated parts), Conflict theory (competition over resources/power), Symbolic interactionism (micro-level shared meanings)."),
    C("s-ps-6", "ps", "Social Psych", "Fundamental attribution error?", "Overemphasizing dispositional (personality) causes and underemphasizing situational causes for others' behavior."),
    C("s-ps-7", "ps", "Emotion", "James–Lange vs Cannon–Bard vs Schachter–Singer?", "James–Lange: physiology → emotion. Cannon–Bard: physiology & emotion simultaneously. Schachter–Singer: physiology + cognitive label → emotion."),
    C("s-ps-8", "ps", "Disorders", "Positive vs negative symptoms of schizophrenia?", "Positive: ADD to behavior (hallucinations, delusions). Negative: REMOVE from behavior (flat affect, avolition, anhedonia)."),
    C("s-ps-9", "ps", "Biology", "Functions of amygdala, hippocampus, hypothalamus?", "Amygdala: fear & emotion. Hippocampus: forming new long-term (declarative) memories. Hypothalamus: homeostasis — hunger, thirst, temperature, endocrine control via the pituitary."),
    C("s-ps-10", "ps", "Biology", "Roles of dopamine, serotonin, and GABA?", "Dopamine: reward & movement (deficit → Parkinson's). Serotonin: mood, sleep, appetite. GABA: the main inhibitory neurotransmitter (reduces anxiety/excitability)."),
    C("s-ps-11", "ps", "Consciousness", "Sleep stages & their EEG waves?", "Awake: beta → relaxed alpha. N1: theta. N2: sleep spindles & K-complexes. N3: delta (deep sleep). REM: beta-like waves, dreaming, muscle paralysis. ~90-min cycles."),
    C("s-ps-12", "ps", "Identity", "Cooley's 'looking-glass self'?", "We build our self-concept based on how we imagine others perceive and judge us."),
    C("s-ps-13", "ps", "Identity", "Erikson's adolescent stage?", "Identity vs. role confusion — forming a coherent sense of self; failure leads to confusion about one's role."),
    C("s-ps-14", "ps", "Attitudes", "Cognitive dissonance?", "Discomfort from holding conflicting attitudes/behaviors; resolved by changing an attitude or behavior to restore consistency (Festinger)."),
    C("s-ps-15", "ps", "Attitudes", "Elaboration Likelihood Model — central vs peripheral route?", "Central: persuasion via the logic/content of the argument (deep processing, lasting). Peripheral: via superficial cues like attractiveness or length (temporary)."),
    C("s-ps-16", "ps", "Culture", "Ethnocentrism vs cultural relativism?", "Ethnocentrism: judging another culture by your own culture's standards. Cultural relativism: understanding a culture on its own terms. (Material = objects; nonmaterial = ideas/values/norms.)"),
    C("s-ps-17", "ps", "Med Sociology", "Parsons' 'sick role'?", "The sick are exempt from normal duties and not blamed for illness, but are obligated to want to recover and to seek competent help."),
    C("s-ps-18", "ps", "Med Sociology", "Social determinants of health?", "The conditions in which people are born, live, and work — income, education, environment, healthcare access — that shape health and drive disparities."),

    // CARS (skill prompts rather than facts)
    C("s-cars-1", "cars", "Strategy", "First move when a CARS question asks what the author would 'most likely agree with'?", "Return to the author's main argument/tone. Eliminate answers that contradict the author's stance or overreach beyond the passage's scope."),
    C("s-cars-2", "cars", "Strategy", "Trap answer pattern: extreme language?", "Words like 'always', 'never', 'all', 'only' are usually too strong for humanities passages. Favor moderate, qualified answers unless the author is explicitly absolute.")
  ];

  window.FlashcardSeed = SEED;
})();
