/**
 * Centralized Single Source of Truth for MDSAIPS Service Domains & Subcategories
 */
export const DOMAINS = {
  event: {
    key: 'event',
    label: 'Event Planning',
    subCategories: [
      { key: 'venue', label: 'Venue Booking' },
      { key: 'catering', label: 'Catering & Dining' },
      { key: 'dj', label: 'DJ & Sound System' },
      { key: 'decoration', label: 'Floral & Stage Decoration' },
      { key: 'photography', label: 'Photography & Photo Booth' },
      { key: 'videography', label: 'Videography & Film Production' },
      { key: 'transport', label: 'Luxury Transport & Chauffeur' },
      { key: 'makeup', label: 'Bridal Makeup & Styling' },
      { key: 'mehendi', label: 'Mehendi Artist' },
    ],
  },
  construction: {
    key: 'construction',
    label: 'Construction & Renovation',
    subCategories: [
      { key: 'contractor', label: 'General Construction Contractor' },
      { key: 'architect', label: 'Architectural Design' },
      { key: 'electrician', label: 'Electrical Wiring & Contracting' },
      { key: 'plumber', label: 'Plumbing & Drainage Systems' },
      { key: 'interior', label: 'Interior Design & Woodwork' },
      { key: 'painting', label: 'Exterior & Interior Painting' },
      { key: 'materials', label: 'Building Materials Supply' },
    ],
  },
  home: {
    key: 'home',
    label: 'Home Services',
    subCategories: [
      { key: 'cleaning', label: 'Deep Cleaning & Sanitization' },
      { key: 'pest_control', label: 'Pest Control Services' },
      { key: 'repair', label: 'Appliance Repair' },
      { key: 'painting', label: 'Home Painting' },
      { key: 'electrician', label: 'Home Electrician' },
      { key: 'plumber', label: 'Plumbing Repair' },
      { key: 'security', label: 'CCTV & Home Security' },
    ],
  },
  accommodation: {
    key: 'accommodation',
    label: 'Accommodation & Venues',
    subCategories: [
      { key: 'hotel', label: 'Luxury & Boutique Hotels' },
      { key: 'guest_house', label: 'Guest House & Homestay' },
      { key: 'pg', label: 'PG Accommodation' },
      { key: 'hostel', label: 'Student & Working Hostel' },
      { key: 'resort', label: 'Vacation Resort' },
      { key: 'venue', label: 'Banquet Hall & Event Lawn' },
    ],
  },
};

export const DOMAIN_KEYS = Object.keys(DOMAINS);

export const isValidDomain = (domainKey) => {
  return Boolean(domainKey && DOMAINS[domainKey]);
};

export const getSubcategoriesForDomain = (domainKey) => {
  if (!isValidDomain(domainKey)) return [];
  return DOMAINS[domainKey].subCategories;
};

export default DOMAINS;
