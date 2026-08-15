import React, { useState } from 'react';
import { FileText, CheckCircle2, ShieldCheck, Tag, AlertCircle } from 'lucide-react';
import DomainBookingFields from './DomainBookingFields';

/**
 * BookingForm Component for Multi-Domain Customer Service Reservation
 * Dynamically switches form inputs based on service.category (Event, Construction, Home, Accommodation).
 */
export const BookingForm = ({ service, initialPackage, onSubmit, loading, error }) => {
  const packages = service?.packages || [];

  // Determine initial selected package
  const defaultPkg = initialPackage || (packages.length > 0 ? packages[0].name : 'basic');
  const [selectedPackage, setSelectedPackage] = useState(defaultPkg);

  // Dynamic Domain Form State
  const [formData, setFormData] = useState({
    // Event
    eventType: 'Wedding',
    guestCount: 100,
    eventDate: '',
    venue: '',
    address: '',
    specialRequirements: '',

    // Construction
    projectType: 'Renovation',
    propertyType: 'Residential',
    area: 1000,
    unit: 'sqft',
    projectLocation: '',
    estimatedBudget: 500000,
    preferredStartDate: '',
    projectDescription: '',

    // Home
    serviceType: 'General Repair',
    problemDescription: '',
    preferredDate: '',
    preferredTime: 'Morning',
    serviceAddress: '',
    urgency: 'Normal',

    // Accommodation
    checkInDate: '',
    checkOutDate: '',
    guests: 2,
    rooms: 1,
    guestDetails: '',
    specialRequests: '',

    // Common
    notes: '',
  });

  const [validationError, setValidationError] = useState('');

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Calculate pricing numbers based on selected package or base service price
  const getSelectedPrice = () => {
    if (selectedPackage && packages.length > 0) {
      const foundPkg = packages.find((p) => p.name.toLowerCase() === selectedPackage.toLowerCase());
      if (foundPkg) return Number(foundPkg.price || 0);
    }
    return Number(service?.price || 0);
  };

  const baseAmount = getSelectedPrice();
  const taxes = Math.round(baseAmount * 0.18);
  const discount = 0;
  const totalAmount = baseAmount + taxes - discount;

  const todayStr = new Date().toISOString().split('T')[0];
  const category = (service?.category || 'event').toLowerCase();

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    const targetDate = formData.eventDate || formData.preferredStartDate || formData.preferredDate || formData.checkInDate;
    if (!targetDate) {
      setValidationError('Please select a date for your reservation.');
      return;
    }

    if (new Date(targetDate) < new Date(todayStr)) {
      setValidationError('Reservation date cannot be in the past.');
      return;
    }

    const bookingPayload = {
      serviceId: service._id,
      packageSelected: selectedPackage,
      eventDate: targetDate,
      eventDetails: { ...formData },
      notes: formData.notes,
    };

    onSubmit(bookingPayload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. SERVICE SUMMARY & HEADER */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider block">Service Booking</span>
            <h2 className="text-2xl font-bold text-white">{service?.title}</h2>
            <p className="text-xs text-slate-400 mt-1">
              Location: {service?.city || service?.location} | Category: <strong className="uppercase text-brand-300">{category}</strong>
            </p>
          </div>
          {service?.vendor?.businessName && (
            <div className="text-right shrink-0">
              <span className="text-xs text-slate-400 block">Vendor</span>
              <span className="text-sm font-bold text-emerald-400 flex items-center justify-end space-x-1">
                <span>{service.vendor.businessName}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. PACKAGE SELECTION TIERS */}
      {packages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Tag className="w-5 h-5 text-purple-400" />
            <span>Select Package Tier</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((pkg) => {
              const isSelected = selectedPackage.toLowerCase() === pkg.name.toLowerCase();
              return (
                <div
                  key={pkg.name}
                  onClick={() => setSelectedPackage(pkg.name)}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 relative space-y-3 ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl shadow-emerald-500/10'
                      : 'glass-card border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4 text-emerald-400">
                      <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{pkg.name} Tier</span>
                    <p className="text-2xl font-extrabold text-white">₹{pkg.price ? pkg.price.toLocaleString('en-IN') : '0'}</p>
                  </div>

                  {pkg.features && (
                    <ul className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                      {pkg.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-center space-x-1.5 text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. DYNAMIC DOMAIN-SPECIFIC BOOKING FIELDS */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-slate-800 space-y-6">
        <DomainBookingFields
          category={category}
          formData={formData}
          onChange={handleFieldChange}
          todayStr={todayStr}
        />

        {/* Additional Notes for Vendor */}
        <div className="space-y-2 pt-4 border-t border-slate-800">
          <label className="text-xs font-semibold text-slate-300 block">Additional Notes for Vendor</label>
          <input
            type="text"
            placeholder="e.g. Please contact me before the scheduled date."
            value={formData.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* 4. PRICE SUMMARY & GST BREAKDOWN */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          <span>Price Breakdown</span>
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>Base Service Amount ({selectedPackage} tier):</span>
            <span className="font-semibold text-white">₹{baseAmount.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between text-slate-300">
            <span>Government GST (18%):</span>
            <span className="font-semibold text-white">₹{taxes.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between text-slate-300">
            <span>Discount Applied:</span>
            <span className="font-semibold text-emerald-400">-₹0</span>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-lg font-bold">
            <span className="text-white">Total Amount:</span>
            <span className="text-2xl font-extrabold text-emerald-400">₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* ERROR DISPLAY */}
      {(validationError || error) && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError || error}</span>
        </div>
      )}

      {/* CTA SUBMIT BUTTON */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-extrabold text-base shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center space-x-2"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
        ) : (
          <span>Request Booking</span>
        )}
      </button>
    </form>
  );
};

export default BookingForm;
