// utils/coursePricing.js
// Single source of truth for how a course price + optional offer is displayed.
export const getOfferState = (course) => {
  const price = Number(course?.price) || 0;
  const offerPrice = Number(course?.offerPrice) || 0;
  const offerEndsAt = course?.offerEndsAt ? new Date(course.offerEndsAt) : null;

  const isOfferActive =
    offerPrice > 0 &&
    offerPrice <= price &&
    (!offerEndsAt || offerEndsAt.getTime() >= Date.now());

  const effectivePrice = isOfferActive ? offerPrice : price;

  return {
    price,
    offerPrice,
    offerLabel: course?.offerLabel || '',
    offerEndsAt,
    isOfferActive,
    effectivePrice,
    discountPercent: isOfferActive ? Math.round(((price - offerPrice) / price) * 100) : 0,
    isFree: effectivePrice === 0,
  };
};

export const formatPrice = (amount) => `₹${(Number(amount) || 0).toLocaleString('en-IN')}`;

// yyyy-mm-dd for <input type="date">
export const toDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};
