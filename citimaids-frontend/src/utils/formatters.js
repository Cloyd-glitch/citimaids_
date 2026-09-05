export const formatUAEPhone = (value) => {
  if (!value) return '';

  // Allow users to delete the prefix completely
  if (['+', '+9', '+97', '+971', '+971 '].includes(value)) {
    return value;
  }

  let cleaned = value.replace(/[^\d+]/g, '');
  if (cleaned === '' || cleaned === '+') return cleaned;

  // Auto-prefix
  if (cleaned.startsWith('0')) {
    cleaned = '+971' + cleaned.substring(1);
  } else if (cleaned.startsWith('971')) {
    cleaned = '+' + cleaned;
  } else if (!cleaned.startsWith('+')) {
    cleaned = '+971' + cleaned;
  } else if (cleaned.startsWith('+') && !cleaned.startsWith('+971')) {
     // If they typed +something else, force +971
     cleaned = '+971' + cleaned.substring(1);
  }

  let digits = cleaned.substring(4);
  digits = digits.substring(0, 9);

  let formatted = '+971';
  if (digits.length > 0) {
    formatted += ' ' + digits.substring(0, 2);
  }
  if (digits.length > 2) {
    formatted += ' ' + digits.substring(2, 5);
  }
  if (digits.length > 5) {
    formatted += ' ' + digits.substring(5, 9);
  }

  return formatted.trim();
};
