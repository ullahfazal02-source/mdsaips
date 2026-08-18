/**
 * Centralized Single Source of Truth for MDSAIPS Frontend Service Domains & Subcategories
 */
export const DOMAINS = {
  event: {
    key: 'event',
    label: 'Event Planning',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
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
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
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
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
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
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
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

export const getDomainLabel = (domainKey) => {
  return DOMAINS[domainKey]?.label || domainKey || 'Service';
};

export const getSubcategoriesForDomain = (domainKey) => {
  return DOMAINS[domainKey]?.subCategories || [];
};

export default DOMAINS;
