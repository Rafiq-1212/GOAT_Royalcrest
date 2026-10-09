"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./SurveyView.module.css";

interface SurveyViewProps {
  onClose: () => void;
}

const COUNTRY_CODES = [
  { code: "+971", label: "UAE", country: "United Arab Emirates", flag: "🇦🇪", placeholder: "50 123 4567", minDigits: 9, maxDigits: 9 },
  { code: "+91", label: "India", country: "India", flag: "🇮🇳", placeholder: "98765 43210", minDigits: 10, maxDigits: 10 },
  { code: "+44", label: "UK", country: "United Kingdom", flag: "🇬🇧", placeholder: "7911 123456", minDigits: 10, maxDigits: 11 },
  { code: "+1", label: "USA", country: "United States", flag: "🇺🇸", placeholder: "(555) 234-5678", minDigits: 10, maxDigits: 10 },
  { code: "+1", label: "Canada", country: "Canada", flag: "🇨🇦", placeholder: "(555) 234-5678", minDigits: 10, maxDigits: 10 },
  { code: "+966", label: "Saudi Arabia", country: "Saudi Arabia", flag: "🇸🇦", placeholder: "50 123 4567", minDigits: 9, maxDigits: 9 },
  { code: "+974", label: "Qatar", country: "Qatar", flag: "🇶🇦", placeholder: "3312 3456", minDigits: 8, maxDigits: 8 },
  { code: "+965", label: "Kuwait", country: "Kuwait", flag: "🇰🇼", placeholder: "5123 4567", minDigits: 8, maxDigits: 8 },
  { code: "+968", label: "Oman", country: "Oman", flag: "🇴🇲", placeholder: "9123 4567", minDigits: 8, maxDigits: 8 },
  { code: "+973", label: "Bahrain", country: "Bahrain", flag: "🇧🇭", placeholder: "3612 3456", minDigits: 8, maxDigits: 8 },
  { code: "+49", label: "Germany", country: "Germany", flag: "🇩🇪", placeholder: "151 23456789", minDigits: 10, maxDigits: 11 },
  { code: "+33", label: "France", country: "France", flag: "🇫🇷", placeholder: "6 12 34 56 78", minDigits: 9, maxDigits: 9 },
  { code: "+41", label: "Switzerland", country: "Switzerland", flag: "🇨🇭", placeholder: "78 123 45 67", minDigits: 9, maxDigits: 9 },
  { code: "+65", label: "Singapore", country: "Singapore", flag: "🇸🇬", placeholder: "8123 4567", minDigits: 8, maxDigits: 8 },
  { code: "+61", label: "Australia", country: "Australia", flag: "🇦🇺", placeholder: "412 345 678", minDigits: 9, maxDigits: 9 },
  { code: "+7", label: "Russia", country: "Russia", flag: "🇷🇺", placeholder: "912 345-67-89", minDigits: 10, maxDigits: 10 },
  { code: "+86", label: "China", country: "China", flag: "🇨🇳", placeholder: "138 0013 8000", minDigits: 11, maxDigits: 11 },
  { code: "+92", label: "Pakistan", country: "Pakistan", flag: "🇵🇰", placeholder: "300 1234567", minDigits: 10, maxDigits: 10 },
  { code: "+20", label: "Egypt", country: "Egypt", flag: "🇪🇬", placeholder: "10 1234 5678", minDigits: 10, maxDigits: 10 },
  { code: "+27", label: "South Africa", country: "South Africa", flag: "🇿🇦", placeholder: "82 123 4567", minDigits: 9, maxDigits: 9 },
  { code: "+39", label: "Italy", country: "Italy", flag: "🇮🇹", placeholder: "320 123 4567", minDigits: 9, maxDigits: 10 },
  { code: "+34", label: "Spain", country: "Spain", flag: "🇪🇸", placeholder: "612 34 56 78", minDigits: 9, maxDigits: 9 },
  { code: "+31", label: "Netherlands", country: "Netherlands", flag: "🇳🇱", placeholder: "6 12345678", minDigits: 9, maxDigits: 9 },
  { code: "+90", label: "Turkey", country: "Turkey", flag: "🇹🇷", placeholder: "532 123 45 67", minDigits: 10, maxDigits: 10 },
  { code: "+60", label: "Malaysia", country: "Malaysia", flag: "🇲🇾", placeholder: "12-345 6789", minDigits: 9, maxDigits: 10 },
  { code: "+234", label: "Nigeria", country: "Nigeria", flag: "🇳🇬", placeholder: "802 123 4567", minDigits: 10, maxDigits: 10 },
  { code: "+254", label: "Kenya", country: "Kenya", flag: "🇰🇪", placeholder: "712 345678", minDigits: 9, maxDigits: 9 },
];

export default function SurveyView({ onClose }: SurveyViewProps) {
  const [step, setStep] = useState<number>(1);
  const [selectedCountryIndex, setSelectedCountryIndex] = useState<number>(0);
  const [phoneDigits, setPhoneDigits] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");
  const [phoneTouched, setPhoneTouched] = useState<boolean>(false);
  const [answers, setAnswers] = useState({
    buyingIntent: "",
    propertyType: "",
    budget: "",
    timeline: "",
    fullName: "",
    email: "",
    phone: "",
    agreed: true,
  });
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const activeCountry = COUNTRY_CODES[selectedCountryIndex] || COUNTRY_CODES[0];

  const validatePhone = (digits: string, country = activeCountry): string => {
    const pure = digits.replace(/\D/g, "");
    if (!pure) {
      return "Mobile number is required";
    }
    const min = country.minDigits || 7;
    const max = country.maxDigits || 15;
    if (pure.length < min) {
      return min === max
        ? `Please enter a valid ${min}-digit mobile number for ${country.label}`
        : `Please enter at least ${min} digits for ${country.label}`;
    }
    if (pure.length > max) {
      return `Mobile number cannot exceed ${max} digits for ${country.label}`;
    }
    return "";
  };

  const handleCountryChange = (index: number) => {
    setSelectedCountryIndex(index);
    const country = COUNTRY_CODES[index];
    if (country) {
      setAnswers((prev) => ({
        ...prev,
        phone: phoneDigits ? `${country.code} ${phoneDigits}`.trim() : "",
      }));
      if (phoneTouched && phoneDigits) {
        setPhoneError(validatePhone(phoneDigits, country));
      }
    }
  };

  const handlePhoneDigitsChange = (rawInput: string) => {
    // Number validation: allow only digits, spaces, parentheses, hyphens
    const filtered = rawInput.replace(/[^\d\s\-()]/g, "");

    // Check if user pasted full international number with +
    const trimmed = rawInput.trim();
    if (trimmed.startsWith("+")) {
      const matchedIdx = COUNTRY_CODES.findIndex((c) => trimmed.startsWith(c.code));
      if (matchedIdx !== -1) {
        setSelectedCountryIndex(matchedIdx);
        const code = COUNTRY_CODES[matchedIdx].code;
        const remaining = trimmed.slice(code.length).replace(/[^\d\s\-()]/g, "").trim();
        setPhoneDigits(remaining);
        setAnswers((prev) => ({
          ...prev,
          phone: `${code} ${remaining}`.trim(),
        }));
        if (phoneTouched) {
          setPhoneError(validatePhone(remaining, COUNTRY_CODES[matchedIdx]));
        }
        return;
      }
    }

    setPhoneDigits(filtered);
    setAnswers((prev) => ({
      ...prev,
      phone: filtered ? `${activeCountry.code} ${filtered.trim()}`.trim() : "",
    }));

    if (phoneTouched) {
      setPhoneError(validatePhone(filtered, activeCountry));
    }
  };

  const handlePhoneBlur = () => {
    setPhoneTouched(true);
    setPhoneError(validatePhone(phoneDigits, activeCountry));
  };

  // Auto-advance helper with smooth feedback
  const handleSelectOption = (field: "buyingIntent" | "propertyType" | "budget" | "timeline", value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
    setTimeout(() => {
      setStep((prev) => prev + 1);
    }, 200);
  };

  const handleBack = () => {
    if (step === 1) {
      onClose();
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number before submission
    const err = validatePhone(phoneDigits, activeCountry);
    if (err) {
      setPhoneError(err);
      setPhoneTouched(true);
      const phoneInput = document.getElementById("form-phone");
      if (phoneInput) {
        phoneInput.focus();
      }
      return;
    }

    setIsSubmitted(true);

    const submissionPhone = answers.phone || (phoneDigits ? `${activeCountry.code} ${phoneDigits.trim()}` : activeCountry.code);
    const finalAnswers = { ...answers, phone: submissionPhone };

    // Persist to Neon DB via Prisma API endpoint
    try {
      await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalAnswers),
      });
    } catch (err) {
      console.warn("Neon DB submission fallback:", err);
    }

    // Local storage fallback for client persistence
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("goat_assets_submissions");
        const existing = stored ? JSON.parse(stored) : [];
        const newSub = {
          id: `SUB-${String(existing.length + 1).padStart(3, "0")}`,
          fullName: finalAnswers.fullName,
          email: finalAnswers.email,
          phone: finalAnswers.phone,
          buyingIntent: finalAnswers.buyingIntent || "To invest",
          propertyType: finalAnswers.propertyType || "Apartment",
          budget: finalAnswers.budget || "AED 1–2 million (₹2.3 Cr – ₹4.6 Cr)",
          timeline: finalAnswers.timeline || "Within 3 months",
          submittedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
        };
        localStorage.setItem("goat_assets_submissions", JSON.stringify([newSub, ...existing]));
      } catch {
        // Fallback safely if localStorage is unavailable
      }
    }
  };

  // Calculate percentage matching reference
  const progressMap: Record<number, number> = {
    1: 0,
    2: 20,
    3: 40,
    4: 60,
    5: 80,
  };
  const currentPercent = progressMap[step] || 0;

  return (
    <div className={styles.surveyContainer}>
      {/* Funnel Ambient Background */}
      <div className={styles.funnelBackground} aria-hidden="true">
        <Image
          src="/Dubai background.png"
          alt="Dubai Skyline Ambient Background"
          fill
          priority
          sizes="100vw"
          quality={85}
          className={styles.funnelBgImage}
        />
        <div className={styles.funnelBgOverlay} />
      </div>

      {/* Header */}
      <header className={styles.header}>
        <a href="#" onClick={(e) => { e.preventDefault(); onClose(); }} className={styles.brand}>
          <Image
            src="/Goatlogo.png"
            alt="Goat Assets Dubai"
            width={180}
            height={52}
            priority
            className={styles.brandLogo}
          />
        </a>

        {!isSubmitted && (
          <div className={styles.progressGroup}>
            <div className={styles.progressTextRow}>
              <span className={styles.stepLabel}>Step {step} of 5</span>
              <span className={styles.percentLabel}>{currentPercent}%</span>
            </div>
            <div className={styles.progressBarTrack}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${currentPercent}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Main Questionnaire Stage */}
      <main className={styles.mainContent}>
        {!isSubmitted ? (
          <div className={styles.surveyCard}>
            {/* STEP 1: Why are you buying? */}
            {step === 1 && (
              <div>
                <div className={styles.stepIndicator}>Step 1 of 5</div>
                <h1 className={styles.questionHeading}>Why are you buying?</h1>

                <div className={styles.gridStep1}>
                  {/* Option: To live in */}
                  <div
                    className={`${styles.optionCard} ${answers.buyingIntent === "To live in" ? styles.optionCardSelected : ""}`}
                    onClick={() => handleSelectOption("buyingIntent", "To live in")}
                  >
                    <div className={`${styles.radioCircle} ${answers.buyingIntent === "To live in" ? styles.radioCircleSelected : ""}`} />
                    <div className={styles.cardIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    <span className={styles.cardLabel}>To live in</span>
                  </div>

                  {/* Option: To invest */}
                  <div
                    className={`${styles.optionCard} ${answers.buyingIntent === "To invest" ? styles.optionCardSelected : ""}`}
                    onClick={() => handleSelectOption("buyingIntent", "To invest")}
                  >
                    <div className={`${styles.radioCircle} ${answers.buyingIntent === "To invest" ? styles.radioCircleSelected : ""}`} />
                    <div className={styles.cardIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                        <polyline points="17 6 23 6 23 12" />
                      </svg>
                    </div>
                    <span className={styles.cardLabel}>To invest</span>
                  </div>

                  {/* Option: Other / Not sure */}
                  <div
                    className={`${styles.optionCard} ${answers.buyingIntent === "Other / Not sure" ? styles.optionCardSelected : ""}`}
                    onClick={() => handleSelectOption("buyingIntent", "Other / Not sure")}
                  >
                    <div className={`${styles.radioCircle} ${answers.buyingIntent === "Other / Not sure" ? styles.radioCircleSelected : ""}`} />
                    <div className={styles.cardIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </div>
                    <span className={styles.cardLabel}>Other / Not sure</span>
                  </div>
                </div>

                <div className={styles.actionRow}>
                  <button type="button" className={styles.backBtn} onClick={handleBack}>
                    ← Return to Homepage
                  </button>
                  <span className={styles.hintText}>Tap an answer to continue</span>
                </div>
              </div>
            )}

            {/* STEP 2: Which property type? */}
            {step === 2 && (
              <div>
                <div className={styles.stepIndicator}>Step 2 of 5</div>
                <h1 className={styles.questionHeading}>Which property type?</h1>

                <div className={styles.gridStep2}>
                  {/* Option: Apartment */}
                  <div
                    className={`${styles.optionCard} ${answers.propertyType === "Apartment" ? styles.optionCardSelected : ""}`}
                    onClick={() => handleSelectOption("propertyType", "Apartment")}
                  >
                    <div className={`${styles.radioCircle} ${answers.propertyType === "Apartment" ? styles.radioCircleSelected : ""}`} />
                    <div className={styles.cardIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="4" y="2" width="16" height="20" rx="2" />
                        <line x1="9" y1="6" x2="9" y2="6.01" />
                        <line x1="15" y1="6" x2="15" y2="6.01" />
                        <line x1="9" y1="10" x2="9" y2="10.01" />
                        <line x1="15" y1="10" x2="15" y2="10.01" />
                        <line x1="9" y1="14" x2="9" y2="14.01" />
                        <line x1="15" y1="14" x2="15" y2="14.01" />
                        <path d="M10 22v-4h4v4" />
                      </svg>
                    </div>
                    <span className={styles.cardLabel}>Apartment</span>
                  </div>

                  {/* Option: Villa */}
                  <div
                    className={`${styles.optionCard} ${answers.propertyType === "Villa" ? styles.optionCardSelected : ""}`}
                    onClick={() => handleSelectOption("propertyType", "Villa")}
                  >
                    <div className={`${styles.radioCircle} ${answers.propertyType === "Villa" ? styles.radioCircleSelected : ""}`} />
                    <div className={styles.cardIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    <span className={styles.cardLabel}>Villa</span>
                  </div>

                  {/* Option: Townhouse */}
                  <div
                    className={`${styles.optionCard} ${answers.propertyType === "Townhouse" ? styles.optionCardSelected : ""}`}
                    onClick={() => handleSelectOption("propertyType", "Townhouse")}
                  >
                    <div className={`${styles.radioCircle} ${answers.propertyType === "Townhouse" ? styles.radioCircleSelected : ""}`} />
                    <div className={styles.cardIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M18 2h-3a2 2 0 0 0-2 2v16h7a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
                        <path d="M9 6H6a2 2 0 0 0-2 2v12h7V8a2 2 0 0 0-2-2z" />
                      </svg>
                    </div>
                    <span className={styles.cardLabel}>Townhouse</span>
                  </div>

                  {/* Option: Other / Not sure */}
                  <div
                    className={`${styles.optionCard} ${answers.propertyType === "Other / Not sure" ? styles.optionCardSelected : ""}`}
                    onClick={() => handleSelectOption("propertyType", "Other / Not sure")}
                  >
                    <div className={`${styles.radioCircle} ${answers.propertyType === "Other / Not sure" ? styles.radioCircleSelected : ""}`} />
                    <div className={styles.cardIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </div>
                    <span className={styles.cardLabel}>Other / Not sure</span>
                  </div>
                </div>

                <div className={styles.actionRow}>
                  <button type="button" className={styles.backBtn} onClick={handleBack}>
                    ← Back
                  </button>
                  <span className={styles.hintText}>Tap an answer to continue</span>
                </div>
              </div>
            )}

            {/* STEP 3: What's your budget? */}
            {step === 3 && (
              <div>
                <div className={styles.stepIndicator}>Step 3 of 5</div>
                <h1 className={styles.questionHeading}>What’s your budget?</h1>

                <div className={styles.gridStep3}>
                  {/* Under AED 1 million */}
                  <div
                    className={`${styles.optionCard} ${answers.budget === "Under AED 1 million (Under ₹2.3 Cr)" ? styles.optionCardSelected : ""}`}
                    onClick={() => handleSelectOption("budget", "Under AED 1 million (Under ₹2.3 Cr)")}
                  >
                    <div className={`${styles.radioCircle} ${answers.budget === "Under AED 1 million (Under ₹2.3 Cr)" ? styles.radioCircleSelected : ""}`} />
                    <span className={styles.cardLabel}>Under AED 1 million (Under ₹2.3 Cr)</span>
                  </div>

                  {/* AED 1–2 million */}
                  <div
                    className={`${styles.optionCard} ${answers.budget === "AED 1–2 million (₹2.3 Cr – ₹4.6 Cr)" ? styles.optionCardSelected : ""}`}
                    onClick={() => handleSelectOption("budget", "AED 1–2 million (₹2.3 Cr – ₹4.6 Cr)")}
                  >
                    <div className={`${styles.radioCircle} ${answers.budget === "AED 1–2 million (₹2.3 Cr – ₹4.6 Cr)" ? styles.radioCircleSelected : ""}`} />
                    <span className={styles.cardLabel}>AED 1–2 million (₹2.3 Cr – ₹4.6 Cr)</span>
                  </div>

                  {/* AED 2–5 million */}
                  <div
                    className={`${styles.optionCard} ${answers.budget === "AED 2–5 million (₹4.6 Cr – ₹11.5 Cr)" ? styles.optionCardSelected : ""}`}
                    onClick={() => handleSelectOption("budget", "AED 2–5 million (₹4.6 Cr – ₹11.5 Cr)")}
                  >
                    <div className={`${styles.radioCircle} ${answers.budget === "AED 2–5 million (₹4.6 Cr – ₹11.5 Cr)" ? styles.radioCircleSelected : ""}`} />
                    <span className={styles.cardLabel}>AED 2–5 million (₹4.6 Cr – ₹11.5 Cr)</span>
                  </div>

                  {/* Over AED 5 million */}
                  <div
                    className={`${styles.optionCard} ${answers.budget === "Over AED 5 million (Above ₹11.5 Cr)" ? styles.optionCardSelected : ""}`}
                    onClick={() => handleSelectOption("budget", "Over AED 5 million (Above ₹11.5 Cr)")}
                  >
                    <div className={`${styles.radioCircle} ${answers.budget === "Over AED 5 million (Above ₹11.5 Cr)" ? styles.radioCircleSelected : ""}`} />
                    <span className={styles.cardLabel}>Over AED 5 million (Above ₹11.5 Cr)</span>
                  </div>
                </div>

                <div className={styles.actionRow}>
                  <button type="button" className={styles.backBtn} onClick={handleBack}>
                    ← Back
                  </button>
                  <span className={styles.hintText}>Tap an answer to continue</span>
                </div>
              </div>
            )}

            {/* STEP 4: When do you want to buy? */}
            {step === 4 && (
              <div>
                <div className={styles.stepIndicator}>Step 4 of 5</div>
                <h1 className={styles.questionHeading}>When do you want to buy?</h1>

                <div className={styles.gridStep4}>
                  {/* Within 3 months */}
                  <div
                    className={`${styles.optionCard} ${answers.timeline === "Within 3 months" ? styles.optionCardSelected : ""}`}
                    onClick={() => handleSelectOption("timeline", "Within 3 months")}
                  >
                    <div className={`${styles.radioCircle} ${answers.timeline === "Within 3 months" ? styles.radioCircleSelected : ""}`} />
                    <div className={styles.cardIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <span className={styles.cardLabel}>Within 3 months</span>
                  </div>

                  {/* 3–6 months */}
                  <div
                    className={`${styles.optionCard} ${answers.timeline === "3–6 months" ? styles.optionCardSelected : ""}`}
                    onClick={() => handleSelectOption("timeline", "3–6 months")}
                  >
                    <div className={`${styles.radioCircle} ${answers.timeline === "3–6 months" ? styles.radioCircleSelected : ""}`} />
                    <div className={styles.cardIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <span className={styles.cardLabel}>3–6 months</span>
                  </div>

                  {/* 6+ months */}
                  <div
                    className={`${styles.optionCard} ${answers.timeline === "6+ months" ? styles.optionCardSelected : ""}`}
                    onClick={() => handleSelectOption("timeline", "6+ months")}
                  >
                    <div className={`${styles.radioCircle} ${answers.timeline === "6+ months" ? styles.radioCircleSelected : ""}`} />
                    <div className={styles.cardIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    </div>
                    <span className={styles.cardLabel}>6+ months</span>
                  </div>

                  {/* Other / Not sure */}
                  <div
                    className={`${styles.optionCard} ${answers.timeline === "Other / Not sure" ? styles.optionCardSelected : ""}`}
                    onClick={() => handleSelectOption("timeline", "Other / Not sure")}
                  >
                    <div className={`${styles.radioCircle} ${answers.timeline === "Other / Not sure" ? styles.radioCircleSelected : ""}`} />
                    <div className={styles.cardIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </div>
                    <span className={styles.cardLabel}>Other / Flexible</span>
                  </div>
                </div>

                <div className={styles.actionRow}>
                  <button type="button" className={styles.backBtn} onClick={handleBack}>
                    ← Back
                  </button>
                  <span className={styles.hintText}>Tap an answer to continue</span>
                </div>
              </div>
            )}

            {/* STEP 5: Where can we reach you? */}
            {step === 5 && (
              <div className={styles.step5Wrapper}>
                <div className={`${styles.stepIndicator} ${styles.textCenter}`}>Step 5 of 5</div>
                <h1 className={`${styles.questionHeading} ${styles.textCenter}`}>Where can we reach you?</h1>

                <form onSubmit={handleSubmit} className={styles.formContainer}>
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel} htmlFor="form-fullname">
                        Full name *
                      </label>
                      <input
                        id="form-fullname"
                        type="text"
                        required
                        placeholder="e.g. Alex Morgan"
                        className={styles.textInput}
                        value={answers.fullName}
                        onChange={(e) => setAnswers({ ...answers, fullName: e.target.value })}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel} htmlFor="form-email">
                        Email address *
                      </label>
                      <input
                        id="form-email"
                        type="email"
                        required
                        placeholder="alex@example.com"
                        className={styles.textInput}
                        value={answers.email}
                        onChange={(e) => setAnswers({ ...answers, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel} htmlFor="form-phone">
                      Mobile number *
                    </label>
                    <div className={`${styles.phoneInputContainer} ${phoneError ? styles.inputError : ""}`}>
                      <div className={styles.countryCodeWrapper}>
                        <select
                          id="form-country-code"
                          className={styles.countryCodeSelect}
                          value={selectedCountryIndex}
                          onChange={(e) => handleCountryChange(Number(e.target.value))}
                          aria-label="Country Code"
                        >
                          {COUNTRY_CODES.map((item, idx) => (
                            <option key={`${item.code}-${item.label}`} value={idx}>
                              {item.flag} {item.code} ({item.label})
                            </option>
                          ))}
                        </select>
                        <span className={styles.selectChevron}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </span>
                      </div>
                      <input
                        id="form-phone"
                        type="tel"
                        inputMode="numeric"
                        required
                        placeholder={activeCountry.placeholder}
                        className={styles.phoneInputField}
                        value={phoneDigits}
                        onChange={(e) => handlePhoneDigitsChange(e.target.value)}
                        onBlur={handlePhoneBlur}
                      />
                    </div>
                    {phoneError && (
                      <div className={styles.fieldErrorText}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{phoneError}</span>
                      </div>
                    )}
                  </div>

                  <button type="submit" className={styles.submitBtn}>
                    Book a Call
                  </button>

                  <div className={styles.assuranceStrip}>
                    <span>100% Confidential</span>
                    <span>•</span>
                    <span>No Spam Guaranteed</span>
                  </div>

                  <div className={styles.actionRow} style={{ marginTop: "1rem" }}>
                    <button type="button" className={styles.backBtn} onClick={handleBack}>
                      ← Back
                    </button>
                    <span className={styles.hintText}>Your details stay private</span>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* Success Screen */
          <div className={styles.successCard}>
            <div className={styles.successBadge}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className={styles.successTitle}>Your Offers Are Being Prepared</h2>
            <p className={styles.successDesc}>
              Thank you, {answers.fullName || "valued investor"}. A senior Goat Assets portfolio
              director has matched your criteria and will share curated off-market allocations via
              WhatsApp and email.
            </p>

            <div className={styles.summaryBox}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryKey}>Buying Purpose:</span>
                <span className={styles.summaryVal}>{answers.buyingIntent || "To invest"}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryKey}>Property Type:</span>
                <span className={styles.summaryVal}>{answers.propertyType || "Apartment / Villa"}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryKey}>Budget Allocation:</span>
                <span className={styles.summaryVal}>{answers.budget || "AED 1–2 million"}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryKey}>Acquisition Timeline:</span>
                <span className={styles.summaryVal}>{answers.timeline || "Within 3 months"}</span>
              </div>
            </div>

            <button type="button" className={styles.returnBtn} onClick={onClose}>
              Return to Homepage
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>
          Your preferences stay private. <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a> • Goat Assets Real Estate Dubai
        </span>
      </footer>
    </div>
  );
}
