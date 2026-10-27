export const CATEGORIES = [
  'Textbooks and Notes',
  'Engineering Instruments',
  'Calculators and Electronics',
  'Lab Equipment',
  'Stationery and Art Supplies',
  'Hostel Essentials',
  'Other Student Items',
];

export const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like new' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];

export const CONDITION_LABELS = Object.fromEntries(
  CONDITIONS.map((condition) => [condition.value, condition.label])
);

export const LISTING_STATUS_LABELS = {
  pending: 'Pending review',
  approved: 'Live',
  rejected: 'Needs changes',
  sold: 'Sold',
  removed: 'Removed',
};

export const REPORT_REASONS = [
  { value: 'prohibited_item', label: 'Prohibited or unsafe item' },
  { value: 'misleading', label: 'Misleading photos or description' },
  { value: 'spam', label: 'Spam or duplicate listing' },
  { value: 'scam', label: 'Suspected scam' },
  { value: 'other', label: 'Something else' },
];

export const YEARS = [
  'First year',
  'Second year',
  'Third year',
  'Fourth year',
  'Final year',
  'Postgraduate',
  'Other',
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'relevance', label: 'Relevance' },
];
