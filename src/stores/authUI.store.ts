import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Login Dialog State
interface LoginUIState {
  countryCode: string;
  phoneNumber: string;
  setCountryCode: (code: string) => void;
  setPhoneNumber: (number: string) => void;
  resetLoginForm: () => void;
}

// Signup Dialog State
interface SignupUIState {
  name: string;
  email: string;
  age: string;
  gender: string;
  countryCode: string;
  phoneNumber: string;
  agreedToTerms: boolean;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setAge: (age: string) => void;
  setGender: (gender: string) => void;
  setCountryCode: (code: string) => void;
  setPhoneNumber: (number: string) => void;
  setAgreedToTerms: (agreed: boolean) => void;
  resetSignupForm: () => void;
  populateFromInitial: (phoneNumber: string, countryCode: string) => void;
}

// OTP Dialog State
interface OtpUIState {
  otp: string[];
  setOtp: (otp: string[]) => void;
  setOtpDigit: (index: number, value: string) => void;
  resetOtp: () => void;
}

// Combined Auth UI Store
interface AuthUIStore {
  login: LoginUIState;
  signup: SignupUIState;
  otp: OtpUIState;
}

export const useAuthUIStore = create<AuthUIStore>()(
  devtools(
    (set) => ({
      // Login state
      login: {
        countryCode: 'IN',
        phoneNumber: '',
        setCountryCode: (countryCode) =>
          set(
            (state) => ({ login: { ...state.login, countryCode } }),
            false,
            'authUI/login/setCountryCode'
          ),
        setPhoneNumber: (phoneNumber) =>
          set(
            (state) => ({ login: { ...state.login, phoneNumber } }),
            false,
            'authUI/login/setPhoneNumber'
          ),
        resetLoginForm: () =>
          set(
            (state) => ({
              login: { ...state.login, countryCode: 'IN', phoneNumber: '' },
            }),
            false,
            'authUI/login/resetLoginForm'
          ),
      },

      // Signup state
      signup: {
        name: '',
        email: '',
        age: '',
        gender: '',
        countryCode: 'IN',
        phoneNumber: '',
        agreedToTerms: false,
        setName: (name) =>
          set(
            (state) => ({ signup: { ...state.signup, name } }),
            false,
            'authUI/signup/setName'
          ),
        setEmail: (email) =>
          set(
            (state) => ({ signup: { ...state.signup, email } }),
            false,
            'authUI/signup/setEmail'
          ),
        setAge: (age) =>
          set(
            (state) => ({ signup: { ...state.signup, age } }),
            false,
            'authUI/signup/setAge'
          ),
        setGender: (gender) =>
          set(
            (state) => ({ signup: { ...state.signup, gender } }),
            false,
            'authUI/signup/setGender'
          ),
        setCountryCode: (countryCode) =>
          set(
            (state) => ({ signup: { ...state.signup, countryCode } }),
            false,
            'authUI/signup/setCountryCode'
          ),
        setPhoneNumber: (phoneNumber) =>
          set(
            (state) => ({ signup: { ...state.signup, phoneNumber } }),
            false,
            'authUI/signup/setPhoneNumber'
          ),
        setAgreedToTerms: (agreedToTerms) =>
          set(
            (state) => ({ signup: { ...state.signup, agreedToTerms } }),
            false,
            'authUI/signup/setAgreedToTerms'
          ),
        resetSignupForm: () =>
          set(
            (state) => ({
              signup: {
                ...state.signup,
                name: '',
                email: '',
                age: '',
                gender: '',
                countryCode: 'IN',
                phoneNumber: '',
                agreedToTerms: false,
              },
            }),
            false,
            'authUI/signup/resetSignupForm'
          ),
        populateFromInitial: (phoneNumber, countryCode) =>
          set(
            (state) => ({
              signup: { ...state.signup, phoneNumber, countryCode },
            }),
            false,
            'authUI/signup/populateFromInitial'
          ),
      },

      // OTP state
      otp: {
        otp: ['', '', '', ''],
        setOtp: (otp) =>
          set(
            (state) => ({ otp: { ...state.otp, otp } }),
            false,
            'authUI/otp/setOtp'
          ),
        setOtpDigit: (index, value) =>
          set(
            (state) => {
              const newOtp = [...state.otp.otp];
              newOtp[index] = value;
              return { otp: { ...state.otp, otp: newOtp } };
            },
            false,
            'authUI/otp/setOtpDigit'
          ),
        resetOtp: () =>
          set(
            (state) => ({ otp: { ...state.otp, otp: ['', '', '', ''] } }),
            false,
            'authUI/otp/resetOtp'
          ),
      },
    }),
    { name: 'auth-ui-store' }
  )
);
