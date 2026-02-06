export enum SpecialtyEnum {
  // Internal Medicine
  generalPractice = 'general_practice',
  internalMedicine = 'internal_medicine',
  familyMedicine = 'family_medicine',

  // Surgery
  generalSurgery = 'general_surgery',
  cardiacSurgery = 'cardiac_surgery',
  neurosurgery = 'neurosurgery',
  orthopedicSurgery = 'orthopedic_surgery',
  plasticSurgery = 'plastic_surgery',

  // Women & Children
  gynecology = 'gynecology',
  obstetrics = 'obstetrics',
  pediatrics = 'pediatrics',
  neonatology = 'neonatology',

  // Diagnostics
  radiology = 'radiology',
  pathology = 'pathology',
  laboratoryMedicine = 'laboratory_medicine',

  // Specialized
  cardiology = 'cardiology',
  dermatology = 'dermatology',
  neurology = 'neurology',
  psychiatry = 'psychiatry',
  ophthalmology = 'ophthalmology',
  ent = 'ent', // Ear, Nose, Throat
  urology = 'urology',
  gastroenterology = 'gastroenterology',
  pulmonology = 'pulmonology',
  nephrology = 'nephrology',
  endocrinology = 'endocrinology',
  rheumatology = 'rheumatology',
  oncology = 'oncology',
  dentistry = 'dentistry',
  physicalTherapy = 'physical_therapy',
}

export enum DoctorStatusEnum {
  available = 'available',
  busy = 'busy',
  onLeave = 'on_leave',
  retired = 'retired',
}

export enum DegreeEnum {
  md = 'MD', // Medical Doctor
  mbbs = 'MBBS', // Bachelor of Medicine, Bachelor of Surgery
  phd = 'PhD',
  mbbch = 'MBBCh', // Common in Egypt
  msc = 'MSc', // Master of Science
  fellowship = 'Fellowship',
  diploma = 'Diploma',
}