export function validateRegisterWithEmail(data: any) {
  const { email, name, password } = data;
  if (email && email.length > 150) {
    return { error: "Email must not exceed 150 characters", status: 400 };
  }

  if (name && name.length < 3) {
    return { error: "Name must be atleast three characters", status: 400 };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Invalid email format" };
  }

  if (!password || typeof password !== "string") {
    return { error: "Password is required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long" };
  }

  if (password.length > 30) {
    return { error: "Password must not exceed 100 characters" };
  }

  return { valid: true };
}

export function validateEmailVerification(data: any) {
  const { email } = data;
  if (email.length > 150) {
    return { error: "Email must not exceed 150 characters", status: 400 };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Invalid email format" };
  }

  return { valid: true };
}

export function validateTokenVerification(data: any) {
  const { email, token } = data;
  if (email.length > 150) {
    return { error: "Email must not exceed 150 characters", status: 400 };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Invalid email format" };
  }

  if (token.length != 6) {
    return { error: "verification token must be length 6", status: 400 };
  }

  return { valid: true };
}
