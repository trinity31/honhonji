export type Translation = {
  login: {
    title: string;
    description: string;
    form: {
      email: string;
      emailPlaceholder: string;
      password: string;
      passwordPlaceholder: string;
      forgotPassword: string;
      submit: string;
    };
    noAccount: string;
    signUp: string;
    continueWith: string;
  };
  home: {
    title: string;
    midtitle: string;
    subtitle: string;
  };
  navigation: {
    en: string;
    kr: string;
    es: string;
  };
  join: {
    title: string;
    description: string;
    name: string;
    email: string;
    password: string;
    passwordConfirm: string;
    submit: string;
    loginLink: string;
    errors: {
      required: string;
      invalidEmail: string;
      passwordShort: string;
      passwordMismatch: string;
      alreadyExists: string;
      unknown: string;
    };
    success: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    marketing: string;
    termsPrefix: string;
    termsOfService: string;
    and: string;
    privacyPolicy: string;
    successDescription: string;
    loginLinkPrefix: string;
  };
};
