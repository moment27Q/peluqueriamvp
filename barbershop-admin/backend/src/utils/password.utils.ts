import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export class PasswordUtils {
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
    }

    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'La contraseña debe contener al menos una mayúscula' };
    }

    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'La contraseña debe contener al menos una minúscula' };
    }

    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'La contraseña debe contener al menos un número' };
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return { valid: false, message: 'La contraseña debe contener al menos un carácter especial' };
    }

    return { valid: true };
  }
}
