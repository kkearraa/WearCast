export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((email || '').trim());

// returns an error message, or null when the password is fine
export const passwordProblem = (password) => {
  if (!password || password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Password needs at least one letter and one number.';
  }
  return null;
};
