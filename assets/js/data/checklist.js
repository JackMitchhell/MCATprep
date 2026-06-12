/* checklist.js — Med school application roadmap.
   Phases mirror the real AMCAS cycle timeline. */
(function () {
  const CHECKLIST = [
    {
      phase: "Foundation (12+ months out)",
      items: [
        { id: "ck-gpa", label: "Maintain / strengthen GPA & science GPA", link: "https://students-residents.aamc.org/applying-medical-school/article/your-gpa-and-mcat-score-matter/" },
        { id: "ck-mcat-plan", label: "Set MCAT date & build study plan (this app!)", link: "https://students-residents.aamc.org/taking-mcat-exam/register-mcat-exam" },
        { id: "ck-clinical", label: "Accumulate clinical experience (paid or volunteer)", metric: "clinical" },
        { id: "ck-shadow", label: "Physician shadowing across specialties", metric: "shadowing" },
        { id: "ck-research", label: "Research involvement", metric: "research" },
        { id: "ck-volunteer", label: "Community / non-clinical volunteering", metric: "nonClinicalVolunteering" }
      ]
    },
    {
      phase: "Pre-Application (6–9 months out)",
      items: [
        { id: "ck-mcat-take", label: "Take the MCAT" },
        { id: "ck-lor", label: "Request letters of recommendation (3–5, incl. science faculty)", link: "https://students-residents.aamc.org/applying-medical-school/preparing-apply-medical-school" },
        { id: "ck-school-list", label: "Build balanced school list (reach / target / safety)", link: "https://msar.aamc.org/" },
        { id: "ck-ps", label: "Draft AMCAS personal statement", link: "https://students-residents.aamc.org/applying-medical-school-amcas/amcas-application-process" },
        { id: "ck-activities", label: "Write 15 Work & Activities entries (+3 most meaningful)" },
        { id: "ck-transcripts", label: "Request official transcripts" }
      ]
    },
    {
      phase: "Primary Application (May–June)",
      items: [
        { id: "ck-amcas-open", label: "Submit AMCAS as early as possible", link: "https://students-residents.aamc.org/applying-medical-school-amcas" },
        { id: "ck-verify", label: "Application verified by AMCAS" },
        { id: "ck-fap", label: "Apply for Fee Assistance Program (if eligible)", link: "https://students-residents.aamc.org/applying-medical-school/fee-assistance-program" }
      ]
    },
    {
      phase: "Secondaries (June–August)",
      items: [
        { id: "ck-prewrite", label: "Pre-write common secondary essays (\"Why us\", diversity, adversity)" },
        { id: "ck-secondaries", label: "Return secondaries within ~2 weeks of receipt" },
        { id: "ck-casper", label: "Complete CASPer / situational judgment tests (if required)", link: "https://takealtus.com/" }
      ]
    },
    {
      phase: "Interviews (Aug–March)",
      items: [
        { id: "ck-interview-prep", label: "Practice traditional + MMI interview formats" },
        { id: "ck-interviews", label: "Attend interviews" },
        { id: "ck-thankyou", label: "Send thank-you notes / update letters" }
      ]
    },
    {
      phase: "Decisions (Oct–April)",
      items: [
        { id: "ck-acceptances", label: "Track acceptances / waitlists" },
        { id: "ck-cta", label: "Commit to one school (Plan to Enroll / Commit to Enroll deadlines)" },
        { id: "ck-financial", label: "Compare financial aid offers" }
      ]
    }
  ];

  const EXPERIENCE_TARGETS = {
    clinical: { label: "Clinical hours", target: 150, hint: "Many advise 150+ hours of direct patient contact." },
    shadowing: { label: "Shadowing hours", target: 50, hint: "~50 hours across multiple specialties is a common benchmark." },
    research: { label: "Research hours", target: 200, hint: "Helpful for research-heavy schools; quality > quantity." },
    volunteering: { label: "Clinical volunteering", target: 100, hint: "Volunteering in a clinical setting." },
    nonClinicalVolunteering: { label: "Non-clinical volunteering", target: 100, hint: "Community service shows commitment to others." },
    leadership: { label: "Leadership hours", target: 50, hint: "Leadership roles in any meaningful activity." }
  };

  window.AppChecklist = { CHECKLIST, EXPERIENCE_TARGETS };
})();
