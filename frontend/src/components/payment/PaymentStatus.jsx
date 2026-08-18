import React from 'react';
import { CreditCard, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

/**
 * PaymentStatus Badge Component
 * Render status badges for unpaid, processing, paid, failed, refunded states.
 */
export const PaymentStatus = ({ status = 'unpaid', className = '' }) => {
  const statusConfigs = {
    unpaid: {
      label: 'Unpaid',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/20',
      icon: Clock,
    },
    created: {
      label: 'Processing',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/20',
      icon: CreditCard,
    },
    processing: {
      label: 'Processing',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/20',
      icon: CreditCard,
    },
    paid: {
      label: 'Paid',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
      icon: CheckCircle2,
    },
    failed: {
      label: 'Failed',
      bgColor: 'bg-rose-500/10',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/20',
      icon: AlertCircle,
    },
    refunded: {
      label: 'Refunded',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-500/20',
      icon: AlertCircle,
    },
  };

  const config = statusConfigs[status.toLowerCase()] || statusConfigs.unpaid;
  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold border uppercase tracking-wider ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}
    >
      <IconComponent className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
};

export default PaymentStatus;
