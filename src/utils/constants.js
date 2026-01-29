
export const STATE_INTEREST_RATES = {
  'AL': 7.5, 'AK': 10.5, 'AZ': 10.0, 'AR': 6.0, 'CA': 10.0,
  'CO': 8.0, 'CT': 8.0, 'DE': 5.0, 'DC': 6.0, 'FL': 4.75,
  'GA': 7.0, 'HI': 10.0, 'ID': 12.0, 'IL': 5.0, 'IN': 8.0,
  'IA': 5.0, 'KS': 10.0, 'KY': 6.0, 'LA': 5.0, 'ME': 6.0,
  'MD': 6.0, 'MA': 12.0, 'MI': 5.0, 'MN': 4.0, 'MS': 8.0,
  'MO': 9.0, 'MT': 10.0, 'NE': 12.0, 'NV': 5.25, 'NH': 5.0,
  'NJ': 2.5, 'NM': 8.75, 'NY': 9.0, 'NC': 8.0, 'ND': 6.5,
  'OH': 5.0, 'OK': 6.0, 'OR': 9.0, 'PA': 6.0, 'RI': 12.0,
  'SC': 7.25, 'SD': 10.0, 'TN': 10.0, 'TX': 6.0, 'UT': 10.0,
  'VT': 12.0, 'VA': 6.0, 'WA': 12.0, 'WV': 7.0, 'WI': 5.0,
  'WY': 7.0, 'DEFAULT': 6.0
};

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
