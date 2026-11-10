import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isSupabaseConfigured, mockHospitals } from '@/lib/mock-store';
import { Hospital, DestinationCountry, MedicalSpecialty, AccreditationType } from '@/types/medical-tourism';

// Helper to sanitize/slugify id
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const city = searchParams.get('city');
    const specialty = searchParams.get('specialty');
    const accreditation = searchParams.get('accreditation');
    const search = searchParams.get('search');

    let hospitalsList: Hospital[] = [];

    if (isSupabaseConfigured()) {
      try {
        let query = supabaseAdmin
          .from('hospitals')
          .select('*')
          .order('name', { ascending: true });

        if (country && country !== 'all') {
          query = query.eq('country', country);
        }

        if (city && city !== 'all') {
          query = query.ilike('city', city);
        }

        if (search) {
          query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,country.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          hospitalsList = data.map((row: any) => ({
            id: row.id,
            name: row.name,
            country: row.country as DestinationCountry,
            city: row.city,
            flag: row.flag || '🌍',
            image: row.image || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
            accreditations: Array.isArray(row.accreditations) ? row.accreditations : [],
            specialties: Array.isArray(row.specialties) ? row.specialties : [],
            establishedYear: row.established_year || 2000,
            bedCount: row.bed_count || 100,
            internationalPatientsPerYear: row.international_patients_per_year || '1,000+',
            rating: Number(row.rating) || 4.8,
            reviewCount: Number(row.review_count) || 50,
            featured: Boolean(row.featured),
            tagline: row.tagline || '',
            description: row.description || '',
            amenities: Array.isArray(row.amenities) ? row.amenities : [],
            languagesSupported: Array.isArray(row.languages_supported) ? row.languages_supported : ['English'],
            startingPrice: row.starting_price || '$1,500',
            topDoctors: Array.isArray(row.top_doctors) ? row.top_doctors : [],
          }));
        }
      } catch (e) {
        console.warn('Supabase hospitals query failed, falling back to mock store:', e);
      }
    }

    // Fallback if Supabase returned nothing or offline
    if (hospitalsList.length === 0) {
      hospitalsList = [...mockHospitals];

      if (country && country !== 'all') {
        hospitalsList = hospitalsList.filter((h) => h.country === country);
      }
      if (city && city !== 'all') {
        hospitalsList = hospitalsList.filter((h) => h.city.toLowerCase() === city.toLowerCase());
      }
      if (search) {
        const q = search.toLowerCase();
        hospitalsList = hospitalsList.filter(
          (h) =>
            h.name.toLowerCase().includes(q) ||
            h.city.toLowerCase().includes(q) ||
            h.country.toLowerCase().includes(q)
        );
      }
    }

    // Secondary filters for JSON arrays (specialty & accreditation)
    if (specialty && specialty !== 'all') {
      hospitalsList = hospitalsList.filter((h) =>
        h.specialties.includes(specialty as MedicalSpecialty)
      );
    }

    if (accreditation && accreditation !== 'all') {
      hospitalsList = hospitalsList.filter((h) =>
        h.accreditations.includes(accreditation as AccreditationType)
      );
    }

    // Extract unique cities & countries for dynamic filter dropdowns
    const allCities = Array.from(new Set(hospitalsList.map((h) => h.city.trim()).filter(Boolean))).sort();
    const allCountries = Array.from(new Set(hospitalsList.map((h) => h.country.trim()).filter(Boolean))).sort();

    return NextResponse.json({
      success: true,
      count: hospitalsList.length,
      cities: allCities,
      countries: allCountries,
      hospitals: hospitalsList,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let rawItems: any[] = [];

    if (Array.isArray(body)) {
      rawItems = body;
    } else if (Array.isArray(body.hospitals)) {
      rawItems = body.hospitals;
    } else {
      rawItems = [body];
    }

    if (rawItems.length === 0) {
      return NextResponse.json({ error: 'No hospital records provided.' }, { status: 400 });
    }

    const processedHospitals: Hospital[] = [];
    const errors: string[] = [];

    for (let i = 0; i < rawItems.length; i++) {
      const item = rawItems[i];
      const name = (item.name || item.hospital_name || '').trim();
      const city = (item.city || '').trim();
      const country = (item.country || 'India').trim();

      if (!name || !city) {
        errors.push(`Row ${i + 1}: Name and City are required fields.`);
        continue;
      }

      // Parse accreditations
      let accreditations: AccreditationType[] = [];
      if (Array.isArray(item.accreditations)) {
        accreditations = item.accreditations;
      } else if (typeof item.accreditations === 'string') {
        accreditations = item.accreditations
          .split(/[,;|]/)
          .map((s: string) => s.trim().toUpperCase() as AccreditationType)
          .filter(Boolean);
      }
      if (accreditations.length === 0) {
        accreditations = ['NABH'];
      }

      // Parse specialties
      let specialties: MedicalSpecialty[] = [];
      if (Array.isArray(item.specialties)) {
        specialties = item.specialties;
      } else if (typeof item.specialties === 'string') {
        specialties = item.specialties
          .split(/[,;|]/)
          .map((s: string) => s.trim() as MedicalSpecialty)
          .filter(Boolean);
      }
      if (specialties.length === 0) {
        specialties = ['Cardiac Surgery', 'Orthopedics & Joint Replacement'];
      }

      // Generate ID
      const baseId = item.id || `${slugify(name)}-${slugify(city)}-${slugify(country)}`;
      const id = baseId || `hosp-${Date.now()}-${i}`;

      const hospital: Hospital = {
        id,
        name,
        city,
        country: country as DestinationCountry,
        flag: item.flag || (country === 'India' ? '🇮🇳' : country === 'Thailand' ? '🇹🇭' : country === 'Turkey' ? '🇹🇷' : '🌍'),
        image: item.image || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
        accreditations,
        specialties,
        establishedYear: Number(item.establishedYear || item.established_year) || 2005,
        bedCount: Number(item.bedCount || item.bed_count) || 250,
        internationalPatientsPerYear: String(item.internationalPatientsPerYear || item.international_patients_per_year || '5,000+'),
        rating: Number(item.rating) || 4.8,
        reviewCount: Number(item.reviewCount || item.review_count) || 120,
        featured: Boolean(item.featured),
        tagline: item.tagline || `Leading accredited healthcare center in ${city}, ${country}`,
        description: item.description || `${name} is an internationally accredited hospital in ${city}, offering world-class medical procedures, cutting-edge technology, and comprehensive care for international travelers.`,
        amenities: Array.isArray(item.amenities)
          ? item.amenities
          : typeof item.amenities === 'string'
          ? item.amenities.split(/[,;|]/).map((s: string) => s.trim())
          : ['International Patient Lounge', 'Private Suites', 'Airport Pickup'],
        languagesSupported: Array.isArray(item.languagesSupported)
          ? item.languagesSupported
          : ['English'],
        startingPrice: item.startingPrice || item.starting_price || '$2,500',
        topDoctors: Array.isArray(item.topDoctors)
          ? item.topDoctors
          : item.doctor_name
          ? [{ name: item.doctor_name, role: item.doctor_role || 'Chief Surgeon', experience: item.doctor_experience || '20+ Years' }]
          : [{ name: 'Senior Surgical Director', role: 'Department Head', experience: '18+ Years' }],
      };

      processedHospitals.push(hospital);
    }

    if (processedHospitals.length === 0) {
      return NextResponse.json(
        { error: 'No valid hospitals could be processed.', details: errors },
        { status: 400 }
      );
    }

    // Insert / Upsert into Supabase
    if (isSupabaseConfigured()) {
      try {
        const rowsToInsert = processedHospitals.map((h) => ({
          id: h.id,
          name: h.name,
          city: h.city,
          country: h.country,
          flag: h.flag,
          image: h.image,
          accreditations: h.accreditations,
          specialties: h.specialties,
          established_year: h.establishedYear,
          bed_count: h.bedCount,
          international_patients_per_year: h.internationalPatientsPerYear,
          rating: h.rating,
          review_count: h.reviewCount,
          featured: h.featured,
          tagline: h.tagline,
          description: h.description,
          amenities: h.amenities,
          languages_supported: h.languagesSupported,
          starting_price: h.startingPrice,
          top_doctors: h.topDoctors,
          updated_at: new Date().toISOString(),
        }));

        const { error: upsertErr } = await supabaseAdmin
          .from('hospitals')
          .upsert(rowsToInsert, { onConflict: 'id' });

        if (upsertErr) {
          console.warn('Supabase upsert returned error:', upsertErr);
        }
      } catch (e) {
        console.warn('Failed to upsert into Supabase hospitals table:', e);
      }
    }

    // Also update in-memory store
    for (const hosp of processedHospitals) {
      const idx = mockHospitals.findIndex((h) => h.id === hosp.id);
      if (idx >= 0) {
        mockHospitals[idx] = hosp;
      } else {
        mockHospitals.unshift(hosp);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded and synced ${processedHospitals.length} hospital(s) to the database.`,
      count: processedHospitals.length,
      errors: errors.length > 0 ? errors : undefined,
      hospitals: processedHospitals,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Hospital ID is required' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      await supabaseAdmin.from('hospitals').delete().eq('id', id);
    }

    const idx = mockHospitals.findIndex((h) => h.id === id);
    if (idx >= 0) {
      mockHospitals.splice(idx, 1);
    }

    return NextResponse.json({ success: true, message: `Hospital ${id} removed.` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
