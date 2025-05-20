export type Translation = {
  login: {
    continueWith: string;
  },
  home: {
    title: string;
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
