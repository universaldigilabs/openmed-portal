export type DestinationCountry = 
  | 'India'
  | 'Thailand'
  | 'Turkey'
  | 'Singapore'
  | 'Spain'
  | 'United Arab Emirates'
  | 'Mexico'
  | 'Any Destination';

export type MedicalSpecialty =
  | 'Cardiac Surgery'
  | 'Orthopedics & Joint Replacement'
  | 'Oncology & Cancer Care'
  | 'Cosmetic & Plastic Surgery'
  | 'IVF & Fertility'
  | 'Organ Transplant'
  | 'Dental Surgery & Implants'
  | 'Neuro & Spine Surgery'
  | 'Ophthalmology & Eye Surgery'
  | 'Ayurveda & Holistic Wellness';

export type AccreditationType = 'JCI' | 'NABH' | 'ISO 9001' | 'AACI' | 'TEMOS' | 'MTQUA';

export interface Hospital {
  id: string;
  name: string;
  country: DestinationCountry;
  city: string;
  flag: string;
  image: string;
  accreditations: AccreditationType[];
  specialties: MedicalSpecialty[];
  establishedYear: number;
  bedCount: number;
  internationalPatientsPerYear: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  tagline: string;
  description: string;
  amenities: string[];
  languagesSupported: string[];
  startingPrice: string;
  topDoctors: {
    name: string;
    role: string;
    experience: string;
  }[];
}

export interface ProcedureCost {
  id: string;
  name: string;
  specialty: MedicalSpecialty;
  description: string;
  costs: {
    us: number;
    uk: number;
    india: number;
    thailand: number;
    turkey: number;
    mexico: number;
    spain: number;
  };
  durationHospitalDays: number;
  durationStayDays: number;
  successRate: string;
  inclusions: string[];
}

export interface SpecialistDoctor {
  id: string;
  name: string;
  hospital: string;
  country: DestinationCountry;
  city: string;
  specialty: MedicalSpecialty;
  qualifications: string;
  experienceYears: number;
  proceduresPerformed: string;
  languages: string[];
  rating: number;
  reviewCount: number;
  avatar: string;
  consultationFeeUsd: number;
  turnaroundHours: number;
  bio: string;
}
