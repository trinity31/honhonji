import type { Translation } from "./types";

const ko: Translation = {
  login: {
    title: "로그인",
    description: "계정에 로그인하세요",
    form: {
      email: "이메일",
      emailPlaceholder: "example@example.com",
      password: "비밀번호",
      passwordPlaceholder: "비밀번호를 입력하세요",
      forgotPassword: "비밀번호를 잊으셨나요?",
      submit: "로그인",
    },
    noAccount: "계정이 없으신가요?",
    signUp: "회원가입",
    continueWith: "{{provider}}로 계속하기",
  },
  home: {
    title: "혼혼지",
    midtitle: "혼밥, 혼산책 지도",
    subtitle:
      "나만의 맛집, 나만의 길! 혼자 가기 좋은 맛집과 산책길을 한눈에 찾을 수 있어요.",
  },
  navigation: {
    kr: "한국어",
    es: "스페인어",
    en: "영어",
  },
  join: {
    title: "회원가입",
    description: "회원 정보를 입력하여 계정을 생성하세요.",
    name: "이름",
    email: "이메일",
    password: "비밀번호",
    passwordConfirm: "비밀번호 확인",
    submit: "가입하기",
    loginLink: "로그인",
    errors: {
      required: "필수 입력 항목입니다.",
      invalidEmail: "유효한 이메일 주소를 입력하세요.",
      passwordShort: "비밀번호는 최소 8자 이상이어야 합니다.",
      passwordMismatch: "비밀번호가 일치하지 않습니다.",
      alreadyExists: "이미 가입된 이메일입니다.",
      unknown: "알 수 없는 오류가 발생했습니다. 다시 시도해 주세요.",
    },
    success: "회원가입이 완료되었습니다! 환영합니다.",
    namePlaceholder: "이름을 입력하세요",
    emailPlaceholder: "이메일을 입력하세요",
    marketing: "마케팅 이메일 수신 동의",
    termsPrefix: "이용약관 및 ",
    termsOfService: "이용약관",
    and: " 및 ",
    privacyPolicy: "개인정보 처리방침",
    successDescription: "로그인을 해 주세요. 이 탭은 닫으셔도 됩니다.",
    loginLinkPrefix: "이미 계정이 있으신가요?",
  },
};

export default ko;
