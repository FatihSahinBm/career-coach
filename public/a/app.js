/* =========================================
   MAIN APP ENTRY POINT
   ========================================= */

function init() {
  initTabs();
  initAts();
  initSalary();
  initNetworking();
  initPortfolio();
  initBurnout();
  initInterview();
  initPrint();
  initCopy();

  bindFormPersistence({ key: "careerflow_ats_v1", fields: ["cvText", "jdText", "targetRole", "targetCity"] });
  bindFormPersistence({ key: "careerflow_salary_v1", fields: ["salaryRole", "salaryCity", "salaryYears", "salaryWorkMode", "salarySkills"] });
  bindFormPersistence({ key: "careerflow_pf_v1", fields: ["pfLinkedIn", "pfGithub", "pfPortfolio", "pfRecentActivity", "pfHeadline"] });
}

// Start the app
init();
