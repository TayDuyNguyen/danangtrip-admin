export const validCreateUser = {
  full_name: 'Tran Van C',
  username: 'tran_van_c',
  email: 'tranc@test.com',
  password: 'Pass1234',
  password_confirmation: 'Pass1234',
  role: 'user' as const,
};

export const invalidEmail = 'invalidemail';

export const duplicateEmail = 'exist@test.com';

export const existingUserPayload = {
  full_name: 'Existing User',
  username: 'existing_user',
  email: duplicateEmail,
  password: 'Pass1234',
  password_confirmation: 'Pass1234',
};

export const invalidUsername = 'Invalid-User!';

export const duplicateUsername = 'taken_user';

export const shortPassword = 'Pass1';

export const numbersOnlyPassword = '12345678';

export const invalidPhone = 'abc';

export const longFullName = 'A'.repeat(101);
export const longUsername = 'a'.repeat(51);
/** 101 characters total */
export const longEmail = `${'a'.repeat(92)}@test.com`;
export const longCity = 'C'.repeat(101);

export function buildOptionalCreateUser(suffix = Date.now()) {
  return {
    full_name: 'Optional Fields User',
    username: `opt_user_${suffix}`,
    email: `opt_user_${suffix}@test.com`,
    password: 'Pass1234',
    password_confirmation: 'Pass1234',
    phone: '0905123456',
    birthdate: '1990-05-15',
    gender: 'female' as const,
    city: 'Da Nang',
  };
}
