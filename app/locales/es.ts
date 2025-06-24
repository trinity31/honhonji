import type { Translation } from "./types";

const es: Translation = {
  home: {
    title: "HonHonji",
    midtitle: "Descubrir",
    subtitle: "Comer y caminar solo",
  },
  navigation: {
    en: "Inglés",
    kr: "Coreano",
    es: "Español",
  },
  login: {
    title: "Iniciar sesión",
    description: "Inicia sesión en tu cuenta",
    form: {
      email: "Correo electrónico",
      emailPlaceholder: "Ingresa tu correo",
      password: "Contraseña",
      passwordPlaceholder: "Ingresa tu contraseña",
      forgotPassword: "¿Olvidaste tu contraseña?",
      submit: "Iniciar sesión",
    },
    noAccount: "¿No tienes cuenta?",
    signUp: "Regístrate",
    continueWith: "Continuar con",
  },
  join: {
    title: "Unirse",
    description: "Crea tu cuenta",
    name: "Nombre",
    email: "Correo electrónico",
    password: "Contraseña",
    passwordConfirm: "Confirmar contraseña",
    submit: "Crear cuenta",
    loginLink: "Iniciar sesión",
    errors: {
      required: "Este campo es obligatorio",
      invalidEmail: "Ingresa un correo válido",
      passwordShort: "La contraseña debe tener al menos 8 caracteres",
      passwordMismatch: "Las contraseñas no coinciden",
      alreadyExists: "La cuenta ya existe",
      unknown: "Ocurrió un error",
    },
    success: "Cuenta creada exitosamente",
    namePlaceholder: "Ingresa tu nombre",
    emailPlaceholder: "Ingresa tu correo",
    marketing: "Acepto recibir correos de marketing",
    termsPrefix: "Al registrarte, aceptas nuestros",
    termsOfService: "Términos de servicio",
    and: "y",
    privacyPolicy: "Política de privacidad",
    successDescription: "¡Bienvenido a HonHonji!",
    loginLinkPrefix: "¿Ya tienes cuenta?",
  },
};

export default es;
