import React from 'react';
import {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Zap,
  Film,
  HeartPulse,
  GraduationCap,
  HandHeart,
  BadgeDollarSign,
  Laptop,
  Store,
  TrendingUp,
  Gift,
  MoreHorizontal,
  ArrowRightLeft,
  Landmark,
  CreditCard,
  Banknote,
  Smartphone,
  Wallet,
  LucideIcon
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Zap,
  Film,
  HeartPulse,
  GraduationCap,
  HandHeart,
  BadgeDollarSign,
  Laptop,
  Store,
  TrendingUp,
  Gift,
  MoreHorizontal,
  ArrowRightLeft,
  Landmark,
  CreditCard,
  Banknote,
  Smartphone,
  Wallet,
};

interface CategoryIconProps {
  name?: string;
  className?: string;
  size?: number;
}

export default function CategoryIcon({ name, className = 'w-5 h-5', size }: CategoryIconProps) {
  const IconComponent = (name && ICON_MAP[name]) ? ICON_MAP[name] : Wallet;
  return <IconComponent className={className} size={size} />;
}
