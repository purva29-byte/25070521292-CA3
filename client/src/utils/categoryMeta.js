import {
  BookOpen,
  Calculator,
  FlaskConical,
  House,
  Package,
  PenTool,
  Ruler,
} from 'lucide-react';

export const CATEGORY_META = {
  'Textbooks and Notes': {
    icon: BookOpen,
    tint: 'bg-forest-50 text-forest-700',
    image: '/images/categories/textbooks.jpg',
    description: 'CLRS, Maths, lecture notes & revision binders',
  },
  'Engineering Instruments': {
    icon: Ruler,
    tint: 'bg-ochre-50 text-ochre-700',
    image: '/images/categories/engineering.jpg',
    description: 'Mini drafters, compass sets, drawing boards & clips',
  },
  'Calculators and Electronics': {
    icon: Calculator,
    tint: 'bg-[#E5EDF2] text-[#355B70]',
    image: '/images/categories/calculators.jpg',
    description: 'Casio Classwiz, scientific & graphing calculators',
  },
  'Lab Equipment': {
    icon: FlaskConical,
    tint: 'bg-[#E7ECEB] text-[#3D5F5A]',
    image: '/images/categories/lab.jpg',
    description: 'Lab coats, safety goggles & practical gear',
  },
  'Stationery and Art Supplies': {
    icon: PenTool,
    tint: 'bg-[#F3E4DF] text-[#7C4735]',
    image: '/images/categories/stationery.jpg',
    description: 'Fineliners, sketchbooks, markers & drafting pens',
  },
  'Hostel Essentials': {
    icon: House,
    tint: 'bg-[#EEE9E1] text-[#5B5346]',
    image: '/images/categories/hostel.jpg',
    description: 'Desk study lamps, electric kettles & dorm essentials',
  },
  'Other Student Items': {
    icon: Package,
    tint: 'bg-canvas text-ink/65',
    image: '/images/categories/gadgets.jpg',
    description: 'Headphones, workshop tools & student gear',
  },
};

export function categoryIcon(category) {
  return CATEGORY_META[category]?.icon || Package;
}

export function categoryTint(category) {
  return CATEGORY_META[category]?.tint || 'bg-canvas text-ink/65';
}

export function categoryImage(category) {
  return CATEGORY_META[category]?.image || '/images/categories/textbooks.jpg';
}

export function categoryDescription(category) {
  return CATEGORY_META[category]?.description || 'Campus student essentials';
}

