"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { apiRequest } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, 
  faCheckCircle, 
  faCreditCard, 
  faRocket,
  faChevronRight,
  faChevronLeft,
  faSpinner,
  faMobileAlt,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash
} from "@fortawesome/free-solid-svg-icons";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import { X } from "lucide-react";


import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../lib/firebase";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

type Step = 1 | 2 | 3 | 4;

const PLANS = [
  {
    id: "student_semester",
    name: "Student Member",
    price: "5,000",
    period: "Semester",
    features: ["Academic resources", "Event access", "Basic profile", "Community forums"],
    color: "bg-blue-500",
    tag: "Most Popular"
  },
  {
    id: "staff_semester",
    name: "Staff Member",
    price: "10,000",
    period: "Semester",
    features: ["All student features", "Priority support", "Verified badge", "Advanced analytics"],
    color: "bg-indigo-600",
    tag: "Premium"
  }
];

const PAYMENT_METHODS = [
  {
    id: "mtn_momo",
    name: "MTN MoMo",
    logo: "/mtn-logo.png", // We'll use a stylized div if image fails
    color: "bg-[#FFCC00]",
    textColor: "text-black"
  },
  {
    id: "airtel_money",
    name: "Airtel Money",
    logo: "/airtel-logo.png",
    color: "bg-[#FF0000]",
    textColor: "text-white"
  },
  {
    id: "card",
    name: "Card Payment",
    logo: "/visa-card.png",
    color: "bg-blue-800",
    textColor: "text-white"
  }
];

export default function MultiStepSignup({ onClose, initialStep = 1 }: { onClose?: () => void, initialStep?: Step }) {
  const [step, setStep] = useState<Step>(initialStep);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("mtn_momo");
  const [phone, setPhone] = useState("");
  const { signIn } = useAuth();
  
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      university: "Bugema University",
      terms: false,
    }
  });

  const password = watch("password");

  const nextStep = () => setStep((prev) => (prev + 1) as Step);
  const prevStep = () => setStep((prev) => (prev - 1) as Step);

  const onRegister = async (data: any) => {
    setLoading(true);
    try {
      const { confirmPassword, terms, fullName, ...registerData } = data;
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      const generatedUsername = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}`;
      
      const res = await apiRequest<any>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({
          university: "Bugema University",
          username: generatedUsername,
          firstName,
          lastName,
          ...registerData,
          country: "Uganda"
        }),
      });
      
      if (res.data?.tokens) {
        localStorage.setItem('accessToken', res.data.tokens.accessToken);
        localStorage.setItem('refreshToken', res.data.tokens.refreshToken);
      }
      try {
        await signIn(data.email, password);
      } catch (err) {
        console.error("Firebase auth sign-in failed, but backend user created:", err);
      }
      
      toast.success("Account created successfully!");
      nextStep();
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      const res = await apiRequest<any>("/api/v1/auth/google", {
        method: "POST",
        body: JSON.stringify({ idToken }),
      });
      
      if (res.data?.accessToken) {
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
      } else if (res.data?.tokens) {
        localStorage.setItem('accessToken', res.data.tokens.accessToken);
        localStorage.setItem('refreshToken', res.data.tokens.refreshToken);
      }
      
      toast.success("Signed in with Google!");
      
      // If we are at step 1 and just signed in with Google, 
      // we check if we should move to step 2 or if the user is already done.
      // The parent component or the nextStep logic will handle the state.
      nextStep();
    } catch (error: any) {
      console.error(error);
      toast.error("Google authentication failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const onPayment = async () => {
    if (!selectedPlan) {
      toast.error("Please select a plan first");
      return;
    }

    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      if (paymentMethod === "card") {
        const token = localStorage.getItem('accessToken');
        const res = await apiRequest<any>("/api/v1/payments", {
          method: "POST",
          token: token || undefined,
          body: JSON.stringify({
            plan: selectedPlan,
          }),
        });
        
        if (res.data?.checkoutUrl) {
          window.location.href = res.data.checkoutUrl;
          return;
        }
      }

      // Initiate MoMo/Airtel payment
      const endpoint = paymentMethod === "mtn_momo" ? "/api/v1/payments/momo/request" : "/api/v1/payments/airtel/request";
      const token = localStorage.getItem('accessToken');
      
      await apiRequest(endpoint, {
        method: "POST",
        token: token || undefined,
        body: JSON.stringify({
          phone: phone.replace(/\+/g, ""), // Remove + for API
          plan: selectedPlan,
          amount: PLANS.find(p => p.id === selectedPlan)?.price.replace(",", ""),
          currency: "UGX",
          method: paymentMethod
        }),
      });
      
      toast.success("Payment initiated! Check your phone for the prompt.");
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      nextStep();
    } catch (error: any) {
      toast.error(error.message || "Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, name: "Account", icon: faUser },
    { id: 2, name: "Plan", icon: faRocket },
    { id: 3, name: "Payment", icon: faCreditCard },
    { id: 4, name: "Success", icon: faCheckCircle },
  ];


  return (
    <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-100">
      {/* Centered Header */}
      <div className="pt-8 pb-2 text-center">
        <h2 className="text-xl font-bold text-gray-900">Become a member</h2>
        <p className="text-[13px] text-gray-500 mt-1">Join us today and get started</p>
      </div>

      {/* Progress Dots (Kept as requested) */}
      <div className="px-8 pb-2 flex gap-1.5">
        {steps.map((s) => (
          <div 
            key={s.id} 
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= s.id ? 'bg-blue-600' : 'bg-gray-100'}`}
          />
        ))}
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="space-y-4">

                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">Full name</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                           <FontAwesomeIcon icon={faUser} className="text-xs" />
                        </span>
                        <input 
                          {...register("fullName", { required: "Full name is required" })}
                          className="input-field !pl-10 pr-4" 
                          placeholder="Enter your full name"
                        />
                      </div>
                      {errors.fullName && <p className="error-text text-[10px]">{errors.fullName.message}</p>}
                    </div>



                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">Email address</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                           <FontAwesomeIcon icon={faEnvelope} className="text-xs" />
                        </span>
                        <input 
                          {...register("email", { 
                            required: "Required",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email"
                            }
                          })}
                          className="input-field !pl-10 pr-4" 
                          type="email"
                          placeholder="Enter your email address"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">We'll never share your email with anyone else.</p>
                      {errors.email && <p className="error-text text-[10px]">{errors.email.message}</p>}
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">Password</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                           <FontAwesomeIcon icon={faLock} className="text-xs" />
                        </span>
                        <input 
                          {...register("password", { 
                            required: "Required",
                            minLength: { value: 8, message: "Min 8 chars" }
                          })}
                          className="input-field !pl-10 pr-10" 
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                        />
                        <span 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                        >
                          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-xs" />
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">At least 8 characters with numbers and letters.</p>
                    </div>
                    
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">Confirm password</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                           <FontAwesomeIcon icon={faLock} className="text-xs" />
                        </span>
                        <input 
                          {...register("confirmPassword", { 
                            required: "Please confirm your password",
                            validate: value => value === password || "Passwords do not match"
                          })}
                          className="input-field !pl-10 pr-10" 
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                        />
                        <span 
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                        >
                          <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} className="text-xs" />
                        </span>
                      </div>
                    </div>

                    {/* Checklist */}
                    <div className="grid grid-cols-2 gap-y-1.5 pt-1.5">
                      <div className={`flex items-center gap-2 text-[11px] ${password?.length >= 8 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                        <FontAwesomeIcon icon={faCheckCircle} className="text-[11px]" />
                        <span>Min 8 characters</span>
                      </div>
                      <div className={`flex items-center gap-2 text-[11px] ${/[A-Z]/.test(password || "") ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                        <FontAwesomeIcon icon={faCheckCircle} className="text-[11px]" />
                        <span>Uppercase letter</span>
                      </div>
                      <div className={`flex items-center gap-2 text-[11px] ${/[0-9]/.test(password || "") ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                        <FontAwesomeIcon icon={faCheckCircle} className="text-[11px]" />
                        <span>One number</span>
                      </div>
                      <div className={`flex items-center gap-2 text-[11px] ${/[!@#$%^&*]/.test(password || "") ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                        <FontAwesomeIcon icon={faCheckCircle} className="text-[11px]" />
                        <span>Special character</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2 pt-2">
                      <input 
                        type="checkbox" 
                        {...register("terms", { required: true })}
                        className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      />
                      <p className="text-[11px] text-gray-600 leading-tight">
                        I agree to the <span className="text-blue-600 font-medium cursor-pointer underline">Terms</span> and <span className="text-blue-600 font-medium cursor-pointer underline">Privacy Policy</span>
                      </p>
                    </div>
                    {errors.terms && <p className="error-text text-[10px]">You must agree to the terms</p>}

                    <button 
                      disabled={!!(loading || (password && password.length < 8))}
                      type="submit"
                      onClick={handleSubmit(onRegister)}
                      className="mt-3 flex w-full items-center justify-center rounded-lg bg-blue-600 py-2.5 font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                    >
                      {loading ? <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> : "Next: Select Plan"}
                    </button>

                    <div className="relative flex items-center py-2">
                      <div className="flex-grow border-t border-gray-100"></div>
                      <span className="mx-2 flex-shrink text-[9px] font-bold text-gray-300">OR</span>
                      <div className="flex-grow border-t border-gray-100"></div>
                    </div>

                    <p className="text-center text-[11px] text-gray-500 pb-2">
                      Already have an account? <span className="text-blue-600 font-semibold cursor-pointer">Sign in</span>
                    </p>
                  </div>
                </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-4">
                {PLANS.map((p) => (
                  <div 
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={`relative flex cursor-pointer items-center justify-between rounded-2xl border-2 p-5 transition-all ${selectedPlan === p.id ? 'border-bugema-blue bg-blue-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${p.color} text-white shadow-lg`}>
                        <FontAwesomeIcon icon={faRocket} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{p.name}</h3>
                        <p className="text-xs text-gray-500">{p.features.slice(0, 2).join(", ")}...</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-bugema-blue">UGX {p.price}</div>
                      <div className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Per {p.period}</div>
                    </div>
                    {p.tag && (
                      <span className="absolute -top-2.5 right-4 rounded-full bg-bugema-accent px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-sm">
                        {p.tag}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={prevStep}
                  className="flex flex-1 items-center justify-center rounded-xl border border-gray-200 py-4 font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="mr-2" />
                  Back
                </button>
                <button 
                  disabled={!selectedPlan}
                  onClick={nextStep}
                  className="flex-[2] items-center justify-center rounded-xl bg-bugema-blue py-4 font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
                >
                  Continue
                  <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                {PAYMENT_METHODS.map((m) => (
                  <div 
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 p-4 transition-all ${paymentMethod === m.id ? 'border-bugema-blue bg-blue-50/50 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <div className={`mb-3 flex h-12 w-full items-center justify-center rounded-xl ${m.color} ${m.textColor} font-black uppercase tracking-tighter text-lg italic shadow-inner overflow-hidden relative group`}>
                      {/* Stylized Logo Text */}
                      {m.id === "mtn_momo" ? (
                        <div className="flex items-center gap-1">
                          <span className="bg-black text-[#FFCC00] px-1 rounded">MTN</span>
                          <span className="text-[10px] lowercase font-normal not-italic tracking-normal">MoMo</span>
                        </div>
                      ) : m.id === "airtel_money" ? (
                        <div className="flex items-center gap-1">
                          <span className="font-serif italic border-b-2 border-white leading-none">airtel</span>
                          <span className="text-[10px] font-normal tracking-normal uppercase">Money</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                           <FontAwesomeIcon icon={faCreditCard} className="text-white text-sm" />
                           <span className="text-xs font-bold">VISA / MASTER</span>
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-bold text-gray-700">{m.name}</span>
                    {paymentMethod === m.id && (
                       <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-bugema-blue text-white text-[10px]">
                         <FontAwesomeIcon icon={faCheckCircle} />
                       </div>
                    )}
                  </div>
                ))}
              </div>


              {paymentMethod !== "card" && (
              <div className="space-y-4">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">Phone Number (MoMo)</label>
                <div className="international-phone-container">
                  <PhoneInput
                    defaultCountry="ug"
                    value={phone}
                    onChange={(p) => setPhone(p)}
                    className="w-full"
                    inputClassName="!w-full !h-[42px] !rounded-xl !border-gray-200 !bg-gray-50 !text-gray-900 !font-bold"
                  />
                </div>
                <p className="text-[10px] text-gray-400">Enter the number that will receive the payment prompt.</p>
              </div>
              )}

              {paymentMethod === "card" && (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
                   <FontAwesomeIcon icon={faLock} className="text-blue-600 mb-2" />
                   <p className="text-xs text-gray-600">Secure card payment via Stripe. You will be redirected to complete your purchase.</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={prevStep}
                  className="flex flex-1 items-center justify-center rounded-xl border border-gray-200 py-4 font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button 
                  disabled={loading}
                  onClick={onPayment}
                  className="flex-[2] items-center justify-center rounded-xl bg-bugema-blue py-4 font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-70"
                >
                  {loading ? <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> : "Pay UGX " + PLANS.find(p => p.id === selectedPlan)?.price}
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-6 text-center space-y-6"
            >
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-inner">
                <FontAwesomeIcon icon={faCheckCircle} size="4x" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tight text-gray-900">Success!</h2>
                <p className="text-gray-500">Your account is ready and membership active.</p>
              </div>

              <button 
                onClick={() => window.location.href = "/feed"}
                className="w-full rounded-xl bg-bugema-blue py-4 font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-blue-700 active:scale-[0.98]"
              >
                Go to Feed
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

