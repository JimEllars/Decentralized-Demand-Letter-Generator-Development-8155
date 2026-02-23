
export const STATE_NAMES = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'DC': 'District of Columbia', 'FL': 'Florida',
  'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana',
  'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine',
  'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
  'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire',
  'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota',
  'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island',
  'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
  'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin',
  'WY': 'Wyoming'
};

export const STATE_LEGAL_DETAILS = {
  'AL': { rate: 7.5, statute: 'Ala. Code § 8-8-10' },
  'AK': { rate: 10.5, statute: 'Alaska Stat. § 45.45.010' },
  'AZ': { rate: 10.0, statute: 'Ariz. Rev. Stat. § 44-1201' },
  'AR': { rate: 6.0, statute: 'Ark. Const. art. XIX, § 13' },
  'CA': { rate: 10.0, statute: 'Cal. Civ. Code § 3289' },
  'CO': { rate: 8.0, statute: 'Colo. Rev. Stat. § 5-12-102' },
  'CT': { rate: 8.0, statute: 'Conn. Gen. Stat. § 37-3a' },
  'DE': { rate: 5.0, statute: 'Del. Code tit. 6, § 2301' },
  'DC': { rate: 6.0, statute: 'D.C. Code § 28-3302' },
  'FL': { rate: 4.75, statute: 'Fla. Stat. § 55.03' },
  'GA': { rate: 7.0, statute: 'Ga. Code § 7-4-2' },
  'HI': { rate: 10.0, statute: 'Haw. Rev. Stat. § 478-2' },
  'ID': { rate: 12.0, statute: 'Idaho Code § 28-22-104' },
  'IL': { rate: 5.0, statute: '815 ILCS 205/2' },
  'IN': { rate: 8.0, statute: 'Ind. Code § 24-4.6-1-102' },
  'IA': { rate: 5.0, statute: 'Iowa Code § 535.2' },
  'KS': { rate: 10.0, statute: 'Kan. Stat. § 16-201' },
  'KY': { rate: 6.0, statute: 'Ky. Rev. Stat. § 360.010' },
  'LA': { rate: 5.0, statute: 'La. Civ. Code art. 2924' },
  'ME': { rate: 6.0, statute: 'Me. Rev. Stat. tit. 14, § 1602' },
  'MD': { rate: 6.0, statute: 'Md. Const. art. III, § 57' },
  'MA': { rate: 12.0, statute: 'Mass. Gen. Laws ch. 231, § 6C' },
  'MI': { rate: 5.0, statute: 'Mich. Comp. Laws § 438.31' },
  'MN': { rate: 4.0, statute: 'Minn. Stat. § 334.01' },
  'MS': { rate: 8.0, statute: 'Miss. Code § 75-17-1' },
  'MO': { rate: 9.0, statute: 'Mo. Rev. Stat. § 408.020' },
  'MT': { rate: 10.0, statute: 'Mont. Code § 31-1-106' },
  'NE': { rate: 12.0, statute: 'Neb. Rev. Stat. § 45-104' },
  'NV': { rate: 5.25, statute: 'Nev. Rev. Stat. § 99.040' },
  'NH': { rate: 5.0, statute: 'N.H. Rev. Stat. § 336:1' },
  'NJ': { rate: 2.5, statute: 'N.J. Court Rules 4:42-11' },
  'NM': { rate: 8.75, statute: 'N.M. Stat. § 56-8-3' },
  'NY': { rate: 9.0, statute: 'N.Y. C.P.L.R. § 5004' },
  'NC': { rate: 8.0, statute: 'N.C. Gen. Stat. § 24-1' },
  'ND': { rate: 6.5, statute: 'N.D. Cent. Code § 47-14-05' },
  'OH': { rate: 5.0, statute: 'Ohio Rev. Code § 1343.03' },
  'OK': { rate: 6.0, statute: 'Okla. Stat. tit. 15, § 266' },
  'OR': { rate: 9.0, statute: 'Or. Rev. Stat. § 82.010' },
  'PA': { rate: 6.0, statute: '41 Pa. Stat. § 202' },
  'RI': { rate: 12.0, statute: 'R.I. Gen. Laws § 6-26-1' },
  'SC': { rate: 7.25, statute: 'S.C. Code § 34-31-20' },
  'SD': { rate: 10.0, statute: 'S.D. Codified Laws § 54-3-16' },
  'TN': { rate: 10.0, statute: 'Tenn. Code § 47-14-123' },
  'TX': { rate: 6.0, statute: 'Tex. Fin. Code § 302.002' },
  'UT': { rate: 10.0, statute: 'Utah Code § 15-1-1' },
  'VT': { rate: 12.0, statute: 'Vt. Stat. tit. 9, § 41a' },
  'VA': { rate: 6.0, statute: 'Va. Code § 6.2-301' },
  'WA': { rate: 12.0, statute: 'Wash. Rev. Code § 19.52.010' },
  'WV': { rate: 7.0, statute: 'W. Va. Code § 47-6-5' },
  'WI': { rate: 5.0, statute: 'Wis. Stat. § 138.04' },
  'WY': { rate: 7.0, statute: 'Wyo. Stat. § 40-14-106' },
  'DEFAULT': { rate: 6.0, statute: 'Applicable Statutory Rate' }
};

export const STATE_INTEREST_RATES = Object.fromEntries(
  Object.keys(STATE_LEGAL_DETAILS).map(key => [key, STATE_LEGAL_DETAILS[key].rate])
);

export const TONE_TEMPLATES = {
  soft: {
    title: "Courtesy Reminder: Payment Request",
    intro: "We value our professional relationship and are writing to remind you of an outstanding balance.",
    closing: "We appreciate your prompt attention to this matter and look forward to resolving this amicably."
  },
  firm: {
    title: "Formal Demand for Payment - Final Notice",
    intro: "Demand is hereby made for the immediate payment of the balance due. This is our final attempt to resolve this before escalating.",
    closing: "Failure to remit payment by the deadline will result in further administrative action."
  },
  aggressive: {
    title: "Notice of Intent to Pursue Legal Action",
    intro: "This serves as a formal legal demand. Your account is severely delinquent and we are prepared to take any and all legal steps to recover this debt.",
    closing: "Consider this your final warning. We will pursue all legal remedies, including statutory interest and collection costs, without further notice."
  },
  professional: {
    title: "Statement of Account",
    intro: "Please find attached the statement of your outstanding account. We request that you review this matter immediately.",
    closing: "Please remit payment at your earliest convenience to avoid any service interruption."
  }
};

export const STATE_SPECIFIC_CLAUSES = {
  'CA': {
    label: "California Disclosure",
    text: "NOTICE: The state Rosenthal Fair Debt Collection Practices Act and the federal Fair Debt Collection Practices Act require that, except under unusual circumstances, collectors may not contact you before 8 a.m. or after 9 p.m. They may not harass you by using threats of violence or arrest or by using obscene language. Collectors may not use false or misleading statements or call you at work if they know or have reason to know that you may not receive personal calls at work. For the most part, collectors may not tell another person, other than your attorney or spouse, about your debt. Collectors may contact another person to confirm your location or enforce a judgment. For more information about debt collection activities, you may contact the Federal Trade Commission at 1-877-FTC-HELP or www.ftc.gov."
  },
  'NY': {
    label: "New York Disclosure",
    text: "Debt collectors, in accordance with the Fair Debt Collection Practices Act, 15 U.S.C. § 1692 et seq., are prohibited from engaging in abusive, deceptive, and unfair debt collection efforts, including but not limited to: (i) the use or threat of violence; (ii) the use of obscene or profane language; and (iii) repeated phone calls made with the intent to annoy, abuse, or harass."
  },
  'TX': {
    label: "Texas Disclosure",
    text: "Asserting a claim for collection of a debt in Texas requires strict adherence to the Texas Debt Collection Act. This communication is an attempt to collect a debt and any information obtained will be used for that purpose."
  },
  'CO': {
    label: "Colorado Disclosure",
    text: "FOR INFORMATION ABOUT THE COLORADO FAIR DEBT COLLECTION PRACTICES ACT, SEE WWW.COAG.GOV/CAR. A consumer has the right to request in writing that a debt collector or collection agency cease further communication with the consumer. A written request to cease communication will not prohibit the debt collector or collection agency from taking any other action authorized by law to collect the debt."
  },
  'MA': {
    label: "Massachusetts Disclosure",
    text: "NOTICE OF IMPORTANT RIGHTS: You have the right to make a written or oral request that telephone calls regarding your debt not be made to you at your place of employment. Any such oral request will be valid for only ten days unless you provide written confirmation of the request postmarked or delivered within seven days of such request. You may terminate this request by writing to the debt collector."
  },
  'MN': {
    label: "Minnesota Disclosure",
    text: "This collection agency is licensed by the Minnesota Department of Commerce."
  },
  // Add other states as needed. Default is empty.
};
