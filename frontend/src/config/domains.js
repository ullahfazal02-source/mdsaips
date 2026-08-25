/**
 * Centralized Single Source of Truth for MDSAIPS Frontend Service Domains & Subcategories
 */

const normalizeString = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
};

export const DOMAINS = {
  event: {
    key: 'event',
    label: 'Event Planning',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    subCategories: [
      { key: 'wedding_marriage', label: 'Wedding & Marriage' },
      { key: 'birthday_party', label: 'Birthday & Party Events' },
      { key: 'corporate_events', label: 'Corporate Events' },
      { key: 'conference_meetings', label: 'Conference & Meetings' },
      { key: 'engagement_reception', label: 'Engagement & Reception' },
      { key: 'event_decoration', label: 'Event Decoration' },
      { key: 'photography_videography', label: 'Photography & Videography' },
      { key: 'catering_food', label: 'Catering & Food' },
      { key: 'dj_music', label: 'DJ & Music' },
      { key: 'sound_lighting', label: 'Sound & Lighting' },
      { key: 'makeup_mehendi', label: 'Makeup & Mehendi' },
      { key: 'invitation_printing', label: 'Invitation & Printing' },
      { key: 'event_equipment', label: 'Event Equipment' },
      { key: 'event_staffing', label: 'Event Staffing' },
      { key: 'event_security', label: 'Event Security' },
      { key: 'event_transportation', label: 'Event Transportation' },
      { key: 'event_venues', label: 'Event Venues' },
      // Backward compatibility aliases
      { key: 'wedding_planning', label: 'Wedding Planning' },
      { key: 'photography', label: 'Photography' },
      { key: 'wedding_photography', label: 'Wedding Photography' },
      { key: 'catering', label: 'Catering' },
      { key: 'stage_decoration', label: 'Stage Decoration' },
    ],
  },
  construction: {
    key: 'construction',
    label: 'Construction & Renovation',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    subCategories: [
      { key: 'building_construction', label: 'Building Construction' },
      { key: 'home_construction', label: 'Home Construction' },
      { key: 'home_renovation', label: 'Home Renovation' },
      { key: 'commercial_construction', label: 'Commercial Construction' },
      { key: 'civil_works', label: 'Civil Works' },
      { key: 'masonry', label: 'Masonry' },
      { key: 'interior_design', label: 'Interior Design' },
      { key: 'architecture', label: 'Architecture' },
      { key: 'flooring_tiles', label: 'Flooring & Tiles' },
      { key: 'painting', label: 'Painting' },
      { key: 'carpentry', label: 'Carpentry' },
      { key: 'electrical_works', label: 'Electrical Works' },
      { key: 'plumbing', label: 'Plumbing' },
      { key: 'waterproofing', label: 'Waterproofing' },
      { key: 'false_ceiling', label: 'False Ceiling' },
      { key: 'pop_gypsum', label: 'POP & Gypsum' },
      { key: 'glass_aluminium', label: 'Glass & Aluminium' },
      { key: 'doors_windows', label: 'Doors & Windows' },
      { key: 'welding_fabrication', label: 'Welding & Fabrication' },
      { key: 'skilled_manpower', label: 'Skilled Manpower' },
      { key: 'construction_labour', label: 'Construction Labour' },
      { key: 'kitchen_renovation', label: 'Kitchen Renovation' },
      { key: 'bathroom_renovation', label: 'Bathroom Renovation' },
      // Backward compatibility aliases
      { key: 'general_contractor', label: 'General Contractor' },
      { key: 'civil_contractor', label: 'Civil Contractor' },
      { key: 'contractor', label: 'Contractor' },
    ],
  },
  home: {
    key: 'home',
    label: 'Home Services',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    groups: [
      { key: 'home_maintenance', label: 'Home & Maintenance' },
      { key: 'appliances_water', label: 'AC, Appliances & Water' },
      { key: 'electrical_smart', label: 'Electrical & Smart Home' },
      { key: 'fabrication_interior', label: 'Fabrication & Interior' },
    ],
    subCategories: [
      // A. Home & Maintenance
      { key: 'plumbing', label: 'Plumbing', group: 'home_maintenance', services: ['Plumber', 'Bathroom Plumbing', 'Pipe Repair', 'Water Tank Repair'] },
      { key: 'electrical', label: 'Electrical', group: 'home_maintenance', services: ['Electrician', 'Electrical Repair', 'Electrical Installation'] },
      { key: 'carpentry', label: 'Carpentry', group: 'home_maintenance', services: ['Carpenter', 'Furniture Repair'] },
      { key: 'painting', label: 'Painting', group: 'home_maintenance', services: ['Painter', 'Wall Painting'] },
      { key: 'tile_fixing', label: 'Tile Fixing', group: 'home_maintenance', services: ['Tile Fixing', 'Floor Installation'] },
      { key: 'waterproofing', label: 'Waterproofing', group: 'home_maintenance', services: ['Waterproofing'] },
      { key: 'masonry_civil_works', label: 'Masonry / Civil Works', group: 'home_maintenance', services: ['Masonry Work', 'Civil Contractor'] },
      { key: 'false_ceiling', label: 'False Ceiling', group: 'home_maintenance', services: ['False Ceiling Installation'] },
      { key: 'pop_gypsum', label: 'POP & Gypsum', group: 'home_maintenance', services: ['POP Works', 'Gypsum Works'] },
      { key: 'handyman', label: 'Handyman', group: 'home_maintenance', services: ['Handyman Services'] },
      { key: 'home_renovation', label: 'Home Renovation', group: 'home_maintenance', services: ['Home Renovation'] },
      { key: 'housekeeping', label: 'Housekeeping', group: 'home_maintenance', services: ['Housekeeping', 'Deep Cleaning'] },
      { key: 'skilled_manpower', label: 'Skilled Manpower', group: 'home_maintenance', services: ['Skilled Manpower'] },
      { key: 'security_services', label: 'Security Services', group: 'home_maintenance', services: ['Security Guards'] },
      { key: 'driver_services', label: 'Driver Services', group: 'home_maintenance', services: ['Drivers'] },

      // B. AC, Appliances & Water
      { key: 'air_conditioning', label: 'Air Conditioning', group: 'appliances_water', services: ['AC Installation', 'AC Repair & Service', 'AC Maintenance', 'AC Technician'] },
      { key: 'refrigerator', label: 'Refrigerator', group: 'appliances_water', services: ['Refrigerator Repair'] },
      { key: 'deep_freezer', label: 'Deep Freezer', group: 'appliances_water', services: ['Deep Freezer Repair'] },
      { key: 'air_cooler', label: 'Air Cooler', group: 'appliances_water', services: ['Air Cooler Service'] },
      { key: 'water_cooler', label: 'Water Cooler', group: 'appliances_water', services: ['Water Cooler Repair'] },
      { key: 'ro_water_purifier', label: 'RO Water Purifier', group: 'appliances_water', services: ['RO Water Purifier Installation', 'RO Water Purifier Repair', 'RO Technician'] },
      { key: 'generator', label: 'Generator', group: 'appliances_water', services: ['Generator Installation', 'Generator Repair & Service'] },
      { key: 'inverter', label: 'Inverter', group: 'appliances_water', services: ['Inverter Installation', 'Inverter Repair'] },
      { key: 'ups', label: 'UPS', group: 'appliances_water', services: ['UPS Installation', 'UPS Repair'] },

      // C. Electrical & Smart Home
      { key: 'cctv', label: 'CCTV', group: 'electrical_smart', services: ['CCTV Installation', 'CCTV Repair & Maintenance', 'CCTV Technician'] },
      { key: 'biometric_systems', label: 'Biometric Systems', group: 'electrical_smart', services: ['Biometric Attendance System', 'Biometric Installation'] },
      { key: 'video_door_phone', label: 'Video Door Phone', group: 'electrical_smart', services: ['Video Door Phone Installation', 'Video Door Phone Repair'] },
      { key: 'home_automation', label: 'Home Automation', group: 'electrical_smart', services: ['Home Automation'] },
      { key: 'smart_home', label: 'Smart Home', group: 'electrical_smart', services: ['Smart Home Installation', 'Smart Home Maintenance'] },
      { key: 'electrical_systems', label: 'Electrical Systems', group: 'electrical_smart', services: ['Electrical Services'] },

      // D. Fabrication & Interior
      { key: 'welding_fabrication', label: 'Welding & Fabrication', group: 'fabrication_interior', services: ['Welding', 'Welding & Fabrication', 'Fabricator', 'Metal Fabrication'] },
      { key: 'glass_aluminium', label: 'Glass & Aluminium', group: 'fabrication_interior', services: ['Glass Works', 'Aluminium Works', 'Glass & Aluminium Installation'] },
      { key: 'doors_windows', label: 'Doors & Windows', group: 'fabrication_interior', services: ['Door Repair', 'Window Repair', 'Door Installation', 'Window Installation'] },
      { key: 'curtains_blinds', label: 'Curtains & Blinds', group: 'fabrication_interior', services: ['Curtain Installation', 'Blinds Installation'] },
      { key: 'interior_design', label: 'Interior Design', group: 'fabrication_interior', services: ['Interior Designer', 'Interior Consultation', 'Home Interior Design'] },

      // Backward compatibility aliases
      { key: 'plumber', label: 'Plumber', group: 'home_maintenance' },
      { key: 'electrician', label: 'Electrician', group: 'home_maintenance' },
      { key: 'carpenter', label: 'Carpenter', group: 'home_maintenance' },
      { key: 'painter', label: 'Painter', group: 'home_maintenance' },
      { key: 'deep_cleaning', label: 'Deep Cleaning', group: 'home_maintenance' },
      { key: 'ac_repair_service', label: 'AC Repair & Service', group: 'appliances_water' },
      { key: 'ac_technician', label: 'AC Technician', group: 'appliances_water' },
      { key: 'cleaning', label: 'Cleaning', group: 'home_maintenance' },
    ],
  },
  accommodation: {
    key: 'accommodation',
    label: 'Accommodation & Venues',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    subCategories: [
      { key: 'hotels', label: 'Hotels' },
      { key: 'resorts', label: 'Resorts' },
      { key: 'guest_houses', label: 'Guest Houses' },
      { key: 'hostels', label: 'Hostels' },
      { key: 'pg', label: 'PG' },
      { key: 'pg_paying_guest', label: 'PG / Paying Guest' },
      { key: 'serviced_apartments', label: 'Serviced Apartments' },
      { key: 'vacation_rentals', label: 'Vacation Rentals' },
      { key: 'homestays', label: 'Homestays' },
      { key: 'banquet_halls', label: 'Banquet Halls' },
      { key: 'wedding_venues', label: 'Wedding Venues' },
      { key: 'party_halls', label: 'Party Halls' },
      { key: 'conference_venues', label: 'Conference Venues' },
      { key: 'convention_centres', label: 'Convention Centres' },
      { key: 'farm_houses', label: 'Farm Houses' },
      { key: 'meeting_rooms', label: 'Meeting Rooms' },
      { key: 'corporate_accommodation', label: 'Corporate Accommodation' },
      { key: 'long_stay_accommodation', label: 'Long-Stay Accommodation' },
      // Backward compatibility aliases
      { key: 'hotel', label: 'Hotel' },
    ],
  },
};

export const DOMAIN_KEYS = Object.keys(DOMAINS);

export const getDomainLabel = (domainKey) => {
  if (!domainKey) return 'Service';
  return DOMAINS[domainKey.toLowerCase()]?.label || domainKey;
};

export const getSubcategoriesForDomain = (domainKey) => {
  if (!domainKey) return [];
  return DOMAINS[domainKey.toLowerCase()]?.subCategories || [];
};

export const isValidSubcategoryForDomain = (domainKey, subCategory) => {
  if (!domainKey || !DOMAINS[domainKey.toLowerCase()]) return false;
  if (!subCategory || !subCategory.trim()) return true;

  const domainObj = DOMAINS[domainKey.toLowerCase()];
  const normInput = normalizeString(subCategory);

  return domainObj.subCategories.some((sc) => {
    const normKey = normalizeString(sc.key);
    const normLabel = normalizeString(sc.label);
    if (normKey === normInput || normLabel === normInput) return true;
    if (sc.services && sc.services.some((srv) => normalizeString(srv) === normInput)) return true;
    return false;
  });
};

export default DOMAINS;
