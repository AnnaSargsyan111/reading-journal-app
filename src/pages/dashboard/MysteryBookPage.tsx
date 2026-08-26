import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../lib/authStore";
import { generateRecommendation, generateRecommendationOptions, needsGenreStep } from "../../lib/mysteryEngine";
import { isLatinName } from "../../lib/validation";
import {
  createMysteryOrder,
  listMysteryOrders,
  recordMysteryShown,
  submitMysteryFeedback,
} from "../../lib/mysteryStore";
import { BackIcon } from "../../components/icons";
import type {
  ExperienceId,
  MoodId,
  MysteryBookCandidate,
  MysteryGenreId,
  MysteryOrderRecord,
  RevealMode,
} from "../../types/mystery";
import type { DeliveryAddress } from "../../types/user";

const MOODS: { id: MoodId; emoji: string }[] = [
  { id: "magical", emoji: "✨" },
  { id: "cozy", emoji: "🌿" },
  { id: "escapist", emoji: "🌙" },
  { id: "emotional", emoji: "❤️" },
  { id: "intense", emoji: "🔥" },
  { id: "lightFun", emoji: "☀️" },
  { id: "thoughtProvoking", emoji: "🧠" },
  { id: "mysterious", emoji: "🕯️" },
];

const MYSTERY_GENRES: MysteryGenreId[] = [
  "fantasy",
  "romance",
  "mysteryThriller",
  "scienceFiction",
  "literaryFiction",
  "historicalFiction",
  "horror",
  "adventure",
  "biography",
  "selfDevelopment",
  "youngAdult",
  "nonFiction",
];

const EXPERIENCES: ExperienceId[] = [
  "escapeMe",
  "makeMeFeel",
  "keepMeHooked",
  "makeMeThink",
  "makeMeSmile",
  "surpriseMe",
];

const FEEDBACK_TAGS = ["genre", "story", "writing", "characters", "mood", "author"];

const MYSTERY_PRICE_AMD = 12000;
const DELIVERY_FEE_AMD = 500;

type Step =
  | "entry"
  | "mood"
  | "genre"
  | "experience"
  | "level"
  | "generating"
  | "resultMystery"
  | "resultTeaser"
  | "resultReveal"
  | "delivery"
  | "payment"
  | "confirmMystery"
  | "confirmRevealed"
  | "feedback"
  | "feedbackDone";

const emptyAddress: DeliveryAddress = {
  fullName: "",
  country: "",
  city: "",
  streetAddress: "",
  buildingApartment: "",
  postalCode: "",
  phoneNumber: "",
};

function formatAmd(amount: number): string {
  return `${amount.toLocaleString()} ֏`;
}

// Formats raw digits as they're typed into "MM/YY" (e.g. "1228" -> "12/28").
function formatExpiryInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

// Parses "MM/YY" into a {month, year} pair, or null if the format itself is
// invalid (wrong length or month out of 01–12) — expiry-in-the-past is a
// separate, later check so the two can carry distinct error messages.
function parseExpiry(value: string): { month: number; year: number } | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 4) return null;
  const month = Number(digits.slice(0, 2));
  const year = Number(digits.slice(2, 4));
  if (month < 1 || month > 12) return null;
  return { month, year };
}

function isExpiryInPast(month: number, year: number): boolean {
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  return year < currentYear || (year === currentYear && month < currentMonth);
}

// Natural-language list join: "a", "a and b", "a, b and c" — never "&" or a stray period.
function formatList(items: string[], conjunction: string): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, ${conjunction} ${items[items.length - 1]}`;
}

// A profile can carry a stale/incomplete address object (e.g. from an abandoned order)
// — only treat it as "saved" once every field actually has content.
function hasCompleteAddress(address: DeliveryAddress | undefined): address is DeliveryAddress {
  if (!address) return false;
  return (Object.values(address) as string[]).every((value) => value.trim().length > 0);
}

export function MysteryBookPage() {
  const { t, i18n } = useTranslation();
  const isArmenian = i18n.language.startsWith("hy");
  const { user, refresh } = useAuth();

  const [step, setStep] = useState<Step>("entry");
  const [, setHistory] = useState<Step[]>([]);
  const [moods, setMoods] = useState<MoodId[]>([]);
  const [moodError, setMoodError] = useState("");
  const [genres, setGenres] = useState<MysteryGenreId[]>([]);
  const [genreError, setGenreError] = useState("");
  const [experience, setExperience] = useState<ExperienceId | null>(null);
  const [revealMode, setRevealMode] = useState<RevealMode | null>(null);
  const [levelError, setLevelError] = useState("");
  const [candidate, setCandidate] = useState<MysteryBookCandidate | undefined>();
  const [candidateOptions, setCandidateOptions] = useState<MysteryBookCandidate[]>([]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  // Only treat the profile's address as "on file" once the user has both a complete
  // address and at least one prior Mystery Book order — not just a half-filled draft.
  const hasReturningAddress = Boolean(
    user && hasCompleteAddress(user.deliveryAddress) && listMysteryOrders(user.id).length > 0,
  );
  const [address, setAddress] = useState<DeliveryAddress>(
    hasReturningAddress ? (user!.deliveryAddress as DeliveryAddress) : emptyAddress,
  );
  const [editingAddress, setEditingAddress] = useState(!hasReturningAddress);
  const [nonReturnableChecked, setNonReturnableChecked] = useState(false);
  const [addressErrors, setAddressErrors] = useState<Partial<Record<keyof DeliveryAddress, string>>>({});
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [paymentErrors, setPaymentErrors] = useState<{
    cardNumber?: string;
    cardholderName?: string;
    expiryDate?: string;
    cvv?: string;
    nonReturnable?: string;
  }>({});
  const [order, setOrder] = useState<MysteryOrderRecord | undefined>();
  const [feedbackChoice, setFeedbackChoice] = useState<MysteryOrderRecord["feedback"]>();
  const [feedbackTags, setFeedbackTags] = useState<string[]>([]);

  if (!user) return null;

  const advance = (next: Step) => {
    setHistory((prev) => [...prev, step]);
    setStep(next);
  };

  const goBack = () => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const last = copy.pop()!;
      setStep(last);
      return copy;
    });
  };

  const toggleMood = (id: MoodId) => {
    setMoodError("");
    setMoods((prev) => {
      if (prev.includes(id)) return prev.filter((m) => m !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  const toggleGenre = (id: MysteryGenreId) => {
    setGenreError("");
    setGenres((prev) => {
      if (prev.includes(id)) return prev.filter((g) => g !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const goAfterMood = () => {
    if (moods.length === 0) {
      setMoodError("mysteryBook.mood.error");
      return;
    }
    advance(needsGenreStep(user) ? "genre" : "experience");
  };

  const goAfterGenre = (skip: boolean) => {
    if (!skip && genres.length === 0) {
      setGenreError("mysteryBook.genre.error");
      return;
    }
    advance("experience");
  };

  const runRecommendation = () => {
    if (!revealMode) {
      setLevelError("mysteryBook.level.error");
      return;
    }
    advance("generating");
    setTimeout(() => {
      const picked = generateRecommendation({ user, moods, genres });
      if (picked) {
        recordMysteryShown(user.id, picked.id);
        setCandidateOptions(generateRecommendationOptions({ user, moods, genres }, picked));
      } else {
        setCandidateOptions([]);
      }
      setCandidateIndex(0);
      setCandidate(picked);
      setStep(revealMode === "mystery" ? "resultMystery" : "resultTeaser");
    }, 700);
  };

  // Cycles through up to 5 candidates matching the same mood/genre/experience answers;
  // wraps back to the first one shown after the 5th click.
  const handleChangeBook = () => {
    if (candidateOptions.length <= 1) return;
    const nextIndex = (candidateIndex + 1) % candidateOptions.length;
    setCandidateIndex(nextIndex);
    const next = candidateOptions[nextIndex];
    setCandidate(next);
    recordMysteryShown(user.id, next.id);
  };

  const reasoningMoods = () => {
    if (!candidate) return "";
    const overlap = moods.filter((m) => (candidate.moodProfile[m] ?? 0) >= 0.5);
    const source = overlap.length > 0 ? overlap : moods;
    const labels = source.map((m) => t(`mysteryBook.mood.options.${m}`).toLowerCase());
    // Armenian mood labels can themselves contain "և" (e.g. "Լարված և գրավիչ"), so joining
    // multiple moods with "և" too reads ambiguously — plain commas stay clear there.
    return isArmenian ? labels.join(", ") : formatList(labels, t("common.and"));
  };

  const updateAddress = (field: keyof DeliveryAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    setAddressErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const handleAddressSubmit = () => {
    // Store translation KEYS, not resolved text — resolving here would freeze the
    // error in whatever language was active at submit time, so it wouldn't update
    // if the user switches languages afterward while the error is still showing.
    const nextErrors: Partial<Record<keyof DeliveryAddress, string>> = {};
    (Object.keys(address) as (keyof DeliveryAddress)[]).forEach((field) => {
      if (!address[field].trim()) nextErrors[field] = "common.required";
    });
    const phoneDigits = address.phoneNumber.startsWith(PHONE_PREFIX)
      ? address.phoneNumber.slice(PHONE_PREFIX.length)
      : "";
    if (!nextErrors.phoneNumber && phoneDigits.length !== 6) {
      nextErrors.phoneNumber = "mysteryBook.delivery.phoneInvalid";
    }
    setAddressErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    updateProfile(user.id, { deliveryAddress: address });
    refresh();
    setEditingAddress(false);
    advance("payment");
  };

  // Stores translation KEYS, not resolved text — resolving here would freeze the
  // error in whatever language was active at submit time, so it wouldn't update
  // if the user switches languages afterward while the error is still showing.
  const handlePlaceOrder = () => {
    if (!candidate || !revealMode) return;

    const nextErrors: typeof paymentErrors = {};

    if (!cardNumber.trim()) nextErrors.cardNumber = "common.required";
    else if (cardNumber.length !== 16) nextErrors.cardNumber = "mysteryBook.payment.cardNumberInvalid";

    if (!cardholderName.trim()) nextErrors.cardholderName = "common.required";
    else if (!isLatinName(cardholderName)) nextErrors.cardholderName = "auth.registration.errors.latinOnly";

    if (!expiryDate.trim()) {
      nextErrors.expiryDate = "common.required";
    } else {
      const parsed = parseExpiry(expiryDate);
      if (!parsed) nextErrors.expiryDate = "mysteryBook.payment.expiryInvalid";
      else if (isExpiryInPast(parsed.month, parsed.year)) nextErrors.expiryDate = "mysteryBook.payment.expiryPast";
    }

    if (!cvv.trim()) nextErrors.cvv = "common.required";
    else if (cvv.length !== 3 && cvv.length !== 4) nextErrors.cvv = "mysteryBook.payment.cvvInvalid";

    if (!nonReturnableChecked) nextErrors.nonReturnable = "mysteryBook.payment.agreeRequired";
    setPaymentErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const created = createMysteryOrder(user.id, {
      bookId: candidate.id,
      moods,
      genres,
      experience,
      revealMode,
    });
    setOrder(created);
    setStep(revealMode === "mystery" ? "confirmMystery" : "confirmRevealed");
  };

  const handleSubmitFeedback = () => {
    if (!order || !feedbackChoice) return;
    submitMysteryFeedback(user.id, order.id, feedbackChoice);
    setStep("feedbackDone");
  };

  const resetFlow = () => {
    setStep("entry");
    setMoods([]);
    setGenres([]);
    setExperience(null);
    setRevealMode(null);
    setCandidate(undefined);
    setOrder(undefined);
    setFeedbackChoice(undefined);
    setFeedbackTags([]);
    setNonReturnableChecked(false);
    setCardNumber("");
    setCardholderName("");
    setExpiryDate("");
    setCvv("");
    setPaymentErrors({});
    setMoodError("");
    setGenreError("");
    setLevelError("");
  };

  // ---------- Entry (13.4) ----------
  if (step === "entry") {
    return (
      <div style={{ background: "var(--plum-100)", borderRadius: 20, padding: "56px 24px", textAlign: "center" }}>
        <div
          style={{
            width: 88,
            height: 88,
            margin: "0 auto 20px",
            borderRadius: "50%",
            background: "var(--plum-50)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
          }}
          aria-hidden="true"
        >
          🎁
        </div>
        <h2 style={{ color: "var(--plum-900)", marginBottom: 8 }}>{t("mysteryBook.entryTitle")}</h2>
        <p style={{ color: "var(--plum-700)", marginBottom: 24 }}>{t("mysteryBook.entrySubtitle")}</p>
        <button type="button" className="btn btn-primary" onClick={() => advance("mood")}>
          {t("mysteryBook.entryCta")}
        </button>
      </div>
    );
  }

  // ---------- Step 1: Mood (13.5) ----------
  if (step === "mood") {
    return (
      <QuizShell title={t("mysteryBook.mood.title")} subtitle={t("mysteryBook.mood.subtitle")} onBack={goBack}>
        <CardGrid>
          {MOODS.map(({ id, emoji }) => {
            const selected = moods.includes(id);
            const disabled = !selected && moods.length >= 2;
            return (
              <ToggleCard
                key={id}
                selected={selected}
                disabled={disabled}
                onClick={() => toggleMood(id)}
                emoji={emoji}
                label={t(`mysteryBook.mood.options.${id}`)}
                title={t(`mysteryBook.mood.meanings.${id}`)}
              />
            );
          })}
        </CardGrid>
        {moodError && <p className="form-field__error">{t(moodError)}</p>}
        <button type="button" className="btn btn-primary" onClick={goAfterMood}>
          {t("common.continue")}
        </button>
      </QuizShell>
    );
  }

  // ---------- Step 2: Genre, conditional (13.6) ----------
  if (step === "genre") {
    return (
      <QuizShell title={t("mysteryBook.genre.title")} subtitle={t("mysteryBook.genre.subtitle")} onBack={goBack}>
        <CardGrid>
          {MYSTERY_GENRES.map((id) => {
            const selected = genres.includes(id);
            const disabled = !selected && genres.length >= 3;
            return (
              <ToggleCard
                key={id}
                selected={selected}
                disabled={disabled}
                onClick={() => toggleGenre(id)}
                label={t(`mysteryBook.genre.options.${id}`)}
              />
            );
          })}
        </CardGrid>
        {genreError && <p className="form-field__error">{t(genreError)}</p>}
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button type="button" className="btn btn-secondary" onClick={() => goAfterGenre(true)}>
            {t("mysteryBook.genre.skip")}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => goAfterGenre(false)}>
            {t("common.continue")}
          </button>
        </div>
      </QuizShell>
    );
  }

  // ---------- Step 3: Desired Experience, optional (13.7) ----------
  if (step === "experience") {
    return (
      <QuizShell
        title={t("mysteryBook.experience.title")}
        subtitle={t("mysteryBook.experience.subtitle")}
        onBack={goBack}
      >
        <CardGrid>
          {EXPERIENCES.map((id) => (
            <ToggleCard
              key={id}
              selected={experience === id}
              onClick={() => setExperience(experience === id ? null : id)}
              label={t(`mysteryBook.experience.options.${id}.label`)}
              description={t(`mysteryBook.experience.options.${id}.description`)}
              tone="plum"
            />
          ))}
        </CardGrid>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button type="button" className="btn btn-secondary" onClick={() => advance("level")}>
            {t("mysteryBook.experience.skip")}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => advance("level")}>
            {t("common.continue")}
          </button>
        </div>
      </QuizShell>
    );
  }

  // ---------- Step 4: Mystery Level, mandatory (13.8) ----------
  if (step === "level") {
    return (
      <QuizShell title={t("mysteryBook.level.title")} onBack={goBack}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, margin: "24px 0" }}>
          <LevelCard
            emoji="🎁"
            label={t("mysteryBook.level.mystery.label")}
            description={t("mysteryBook.level.mystery.description")}
            selected={revealMode === "mystery"}
            tone="plum"
            onClick={() => {
              setRevealMode("mystery");
              setLevelError("");
            }}
          />
          <LevelCard
            emoji="👀"
            label={t("mysteryBook.level.sneakPeek.label")}
            description={t("mysteryBook.level.sneakPeek.description")}
            selected={revealMode === "sneakPeek"}
            tone="forest"
            onClick={() => {
              setRevealMode("sneakPeek");
              setLevelError("");
            }}
          />
        </div>
        {levelError && <p className="form-field__error">{t(levelError)}</p>}
        <button type="button" className="btn btn-primary" onClick={runRecommendation}>
          {t("common.continue")}
        </button>
      </QuizShell>
    );
  }

  // ---------- Generating (13.9 pipeline) ----------
  if (step === "generating") {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-muted)" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }} aria-hidden="true">
          🔮
        </div>
        <p>{t("mysteryBook.generating")}</p>
      </div>
    );
  }

  // ---------- Branch A result: Keep It a Mystery (13.12) ----------
  if (step === "resultMystery" && candidate) {
    return (
      <div style={{ background: "var(--forest-800)", borderRadius: 20, padding: "48px 24px", textAlign: "center" }}>
        <h2 style={{ color: "#fff", marginBottom: 8 }}>{t("mysteryBook.result.mysteryHeading")}</h2>
        <p style={{ color: "var(--sage-100)", marginBottom: 24 }}>{t("mysteryBook.result.mysterySubheading")}</p>

        <div
          style={{
            background: "var(--plum-100)",
            color: "var(--plum-900)",
            borderRadius: 14,
            padding: 20,
            maxWidth: 360,
            margin: "0 auto 20px",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, opacity: 0.8 }}>
            {t("mysteryBook.result.matchLabel")}
          </div>
          <div style={{ fontSize: 15 }}>
            {moods.map((m) => `${MOODS.find((mm) => mm.id === m)?.emoji} ${t(`mysteryBook.mood.options.${m}`)}`).join(" · ")}
          </div>
        </div>

        <div style={{ color: "var(--sage-100)", maxWidth: 420, margin: "0 auto 28px" }}>
          <div style={{ fontWeight: 700, marginBottom: 4, color: "#fff" }}>{t("mysteryBook.result.reasoningLabel")}</div>
          <div>{t("mysteryBook.result.reasoningTemplate", { moods: reasoningMoods() })}</div>
        </div>

        <button type="button" className="btn" style={{ background: "#fff", color: "var(--forest-800)" }} onClick={() => advance("delivery")}>
          {t("mysteryBook.result.sendMeMystery")}
        </button>
      </div>
    );
  }

  // ---------- Branch B stage 1: Sneak Peek teaser (13.13) ----------
  if (step === "resultTeaser" && candidate) {
    return (
      <div style={{ background: "var(--forest-800)", borderRadius: 20, padding: "48px 24px", textAlign: "center" }}>
        <h2 style={{ color: "#fff", marginBottom: 24 }}>{t("mysteryBook.result.teaserHeading")}</h2>
        <div
          style={{
            width: 140,
            height: 200,
            margin: "0 auto 20px",
            borderRadius: 10,
            background: "var(--plum-900)",
            filter: "blur(2px)",
          }}
        />
        <p style={{ color: "var(--sage-100)", marginBottom: 28 }}>
          {[
            formatList(candidate.genres.map((g) => t(`mysteryBook.genre.options.${g}`)), t("common.and")),
            reasoningMoods(),
            t("mysteryBook.result.approxLength", { pages: candidate.approxPages }),
          ].join(isArmenian ? ", " : " · ")}
        </p>
        <button type="button" className="btn" style={{ background: "#fff", color: "var(--forest-800)" }} onClick={() => setStep("resultReveal")}>
          {t("mysteryBook.result.revealTitleCta")}
        </button>
      </div>
    );
  }

  // ---------- Branch B stage 2: full reveal (13.13) ----------
  if (step === "resultReveal" && candidate) {
    return (
      <div style={{ textAlign: "center", maxWidth: 420, margin: "0 auto" }}>
        <div
          style={{
            width: 160,
            height: 220,
            margin: "0 auto 20px",
            borderRadius: 10,
            background: "var(--accent-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 12,
            fontWeight: 700,
            color: "var(--forest-800)",
            textAlign: "center",
          }}
        >
          {candidate.title}
        </div>
        <h2 style={{ marginBottom: 2 }}>{candidate.title}</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>{candidate.author}</p>

        <div style={{ textAlign: "left", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{t("mysteryBook.result.revealedReasoningLabel")}</div>
          <div style={{ color: "var(--text-muted)" }}>{t("mysteryBook.result.reasoningTemplate", { moods: reasoningMoods() })}</div>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {candidateOptions.length > 1 && (
            <button type="button" className="btn btn-secondary" onClick={handleChangeBook}>
              {t("mysteryBook.result.changeBook")}
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={() => advance("delivery")}>
            {t("mysteryBook.result.getThisBook")}
          </button>
        </div>
      </div>
    );
  }

  // ---------- Delivery Address (13.16) ----------
  if (step === "delivery") {
    if (!editingAddress && hasReturningAddress) {
      const a = user.deliveryAddress!;
      return (
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <BackButton onBack={goBack} standalone />
          <div className="form-field">
            <span className="form-field__label">{t("mysteryBook.delivery.deliverTo")}</span>
            <div className="form-field__readonly">
              {a.fullName}, {a.streetAddress}, {a.buildingApartment}, {a.city}, {a.country} {a.postalCode} —{" "}
              {a.phoneNumber}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setEditingAddress(true)}>
              {t("common.edit")}
            </button>
            <button type="button" className="btn btn-primary" onClick={() => advance("payment")}>
              {t("mysteryBook.delivery.continueToPayment")}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <StepHeader title={t("mysteryBook.delivery.title")} onBack={goBack} />
        <div className="auth-form" style={{ marginTop: 20 }}>
          <AddressField
            label={t("mysteryBook.delivery.fullName")}
            value={address.fullName}
            onChange={(v) => updateAddress("fullName", v)}
            error={addressErrors.fullName ? t(addressErrors.fullName) : undefined}
          />
          <AddressField
            label={t("mysteryBook.delivery.country")}
            value={address.country}
            onChange={(v) => updateAddress("country", v)}
            error={addressErrors.country ? t(addressErrors.country) : undefined}
          />
          <AddressField
            label={t("mysteryBook.delivery.city")}
            value={address.city}
            onChange={(v) => updateAddress("city", v)}
            error={addressErrors.city ? t(addressErrors.city) : undefined}
          />
          <AddressField
            label={t("mysteryBook.delivery.streetAddress")}
            value={address.streetAddress}
            onChange={(v) => updateAddress("streetAddress", v)}
            error={addressErrors.streetAddress ? t(addressErrors.streetAddress) : undefined}
          />
          <AddressField
            label={t("mysteryBook.delivery.buildingApartment")}
            value={address.buildingApartment}
            onChange={(v) => updateAddress("buildingApartment", v)}
            error={addressErrors.buildingApartment ? t(addressErrors.buildingApartment) : undefined}
          />
          <AddressField
            label={t("mysteryBook.delivery.postalCode")}
            value={address.postalCode}
            onChange={(v) => updateAddress("postalCode", v)}
            error={addressErrors.postalCode ? t(addressErrors.postalCode) : undefined}
          />
          <PhoneField
            label={t("mysteryBook.delivery.phoneNumber")}
            value={address.phoneNumber}
            onChange={(v) => updateAddress("phoneNumber", v)}
            error={addressErrors.phoneNumber ? t(addressErrors.phoneNumber) : undefined}
          />
          <button type="button" className="btn btn-primary" onClick={handleAddressSubmit}>
            {t("mysteryBook.delivery.continueToPayment")}
          </button>
        </div>
      </div>
    );
  }

  // ---------- Payment (13.17) ----------
  if (step === "payment" && candidate && revealMode) {
    const total = MYSTERY_PRICE_AMD + DELIVERY_FEE_AMD;
    return (
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <StepHeader title={t("mysteryBook.payment.summary")} onBack={goBack} />
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, marginBottom: 20, marginTop: 16 }}>
          {revealMode === "sneakPeek" ? (
            <SummaryRow label={`${candidate.title} — ${candidate.author}`} value={formatAmd(MYSTERY_PRICE_AMD)} />
          ) : (
            <SummaryRow label={t("mysteryBook.order.mysteryBookLine")} value={formatAmd(MYSTERY_PRICE_AMD)} />
          )}
          <SummaryRow label={t("mysteryBook.order.deliveryFee")} value={formatAmd(DELIVERY_FEE_AMD)} />
          <SummaryRow label={t("mysteryBook.order.estimatedDelivery")} value="3–5" />
          <SummaryRow
            label={t("mysteryBook.order.deliveryAddress")}
            value={`${address.city}, ${address.streetAddress}`}
          />
          <div style={{ borderTop: "1px solid var(--border)", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
            <span>{t("mysteryBook.payment.total")}</span>
            <span>{formatAmd(total)}</span>
          </div>
        </div>

        <div className="form-field">
          <span className="form-field__label">{t("mysteryBook.payment.method")}</span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              padding: "14px 16px",
              borderRadius: 12,
              border: "1.5px solid var(--forest-800)",
              background: "var(--sage-100)",
            }}
          >
            <span style={{ fontWeight: 700, color: "var(--forest-900)" }}>
              <span aria-hidden="true">💳</span> {t("mysteryBook.payment.cardLabel")}
            </span>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Visa · Mastercard · ArCa</span>
          </div>
        </div>

        <div className="form-field">
          <label className="form-field__label">{t("mysteryBook.payment.cardNumber")}</label>
          <input
            className={paymentErrors.cardNumber ? "form-field__input form-field__input--error" : "form-field__input"}
            placeholder="0000 0000 0000 0000"
            value={cardNumber}
            inputMode="numeric"
            maxLength={16}
            onChange={(e) => {
              setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16));
              if (paymentErrors.cardNumber) setPaymentErrors((prev) => ({ ...prev, cardNumber: undefined }));
            }}
          />
          {paymentErrors.cardNumber && <p className="form-field__error">{t(paymentErrors.cardNumber)}</p>}
        </div>

        <div className="form-field">
          <label className="form-field__label">{t("mysteryBook.payment.cardholderName")}</label>
          <input
            className={
              paymentErrors.cardholderName ? "form-field__input form-field__input--error" : "form-field__input"
            }
            placeholder={t("mysteryBook.payment.cardholderName")}
            value={cardholderName}
            onChange={(e) => {
              setCardholderName(e.target.value);
              if (paymentErrors.cardholderName) setPaymentErrors((prev) => ({ ...prev, cardholderName: undefined }));
            }}
          />
          {paymentErrors.cardholderName && <p className="form-field__error">{t(paymentErrors.cardholderName)}</p>}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div className="form-field" style={{ flex: 1 }}>
            <label className="form-field__label">{t("mysteryBook.payment.expiryDate")}</label>
            <input
              className={
                paymentErrors.expiryDate ? "form-field__input form-field__input--error" : "form-field__input"
              }
              placeholder="MM/YY"
              value={expiryDate}
              inputMode="numeric"
              maxLength={5}
              onChange={(e) => {
                setExpiryDate(formatExpiryInput(e.target.value));
                if (paymentErrors.expiryDate) setPaymentErrors((prev) => ({ ...prev, expiryDate: undefined }));
              }}
            />
            {paymentErrors.expiryDate && <p className="form-field__error">{t(paymentErrors.expiryDate)}</p>}
          </div>
          <div className="form-field" style={{ flex: 1 }}>
            <label className="form-field__label">{t("mysteryBook.payment.cvv")}</label>
            <input
              className={paymentErrors.cvv ? "form-field__input form-field__input--error" : "form-field__input"}
              placeholder="CVV"
              value={cvv}
              inputMode="numeric"
              maxLength={4}
              onChange={(e) => {
                setCvv(e.target.value.replace(/\D/g, "").slice(0, 4));
                if (paymentErrors.cvv) setPaymentErrors((prev) => ({ ...prev, cvv: undefined }));
              }}
            />
            {paymentErrors.cvv && <p className="form-field__error">{t(paymentErrors.cvv)}</p>}
          </div>
        </div>

        <label style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: "16px 0 4px", fontSize: 14 }}>
          <input
            type="checkbox"
            checked={nonReturnableChecked}
            onChange={(e) => {
              setNonReturnableChecked(e.target.checked);
              if (paymentErrors.nonReturnable) setPaymentErrors((prev) => ({ ...prev, nonReturnable: undefined }));
            }}
          />
          {t("mysteryBook.payment.nonReturnable")}
        </label>
        {paymentErrors.nonReturnable && (
          <p className="form-field__error" style={{ marginTop: 0, marginBottom: 12 }}>
            {t(paymentErrors.nonReturnable)}
          </p>
        )}

        <button type="button" className="btn btn-primary btn-block" onClick={handlePlaceOrder}>
          {t("mysteryBook.payment.placeOrder")}
        </button>
      </div>
    );
  }

  // ---------- Order Confirmation — Mystery (13.18) ----------
  if (step === "confirmMystery") {
    return (
      <div style={{ background: "var(--plum-100)", borderRadius: 20, padding: "48px 24px", textAlign: "center" }}>
        <h2 style={{ color: "var(--plum-900)", marginBottom: 8 }}>{t("mysteryBook.confirmation.mysteryHeading")}</h2>
        <p style={{ color: "var(--plum-700)", marginBottom: 24 }}>{t("mysteryBook.confirmation.mysterySubheading")}</p>
        <StatusCard t={t} />
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: 20 }}
          title={t("mysteryBook.confirmation.simulateDeliveryHint")}
          onClick={() => setStep("feedback")}
        >
          {t("mysteryBook.confirmation.simulateDelivery")}
        </button>
      </div>
    );
  }

  // ---------- Order Confirmation — Revealed (13.19) ----------
  if (step === "confirmRevealed" && candidate) {
    return (
      <div style={{ textAlign: "center", maxWidth: 420, margin: "0 auto" }}>
        <h2 style={{ marginBottom: 8 }}>{t("mysteryBook.confirmation.revealedHeading")}</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>
          {candidate.title} — {candidate.author}
        </p>
        <StatusCard t={t} />
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: 20 }}
          title={t("mysteryBook.confirmation.simulateDeliveryHint")}
          onClick={() => setStep("feedback")}
        >
          {t("mysteryBook.confirmation.simulateDelivery")}
        </button>
      </div>
    );
  }

  // ---------- Post-Delivery Feedback (13.20) ----------
  if (step === "feedback") {
    return (
      <div style={{ maxWidth: 420, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ marginBottom: 16 }}>{t("mysteryBook.feedback.title")}</h2>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 24 }}>
          <button type="button" className={feedbackChoice === "loved" ? "btn btn-primary" : "btn btn-secondary"} onClick={() => setFeedbackChoice("loved")}>
            ❤️ {t("mysteryBook.feedback.loved")}
          </button>
          <button type="button" className={feedbackChoice === "okay" ? "btn btn-primary" : "btn btn-secondary"} onClick={() => setFeedbackChoice("okay")}>
            👍 {t("mysteryBook.feedback.okay")}
          </button>
          <button type="button" className={feedbackChoice === "notForMe" ? "btn btn-primary" : "btn btn-secondary"} onClick={() => setFeedbackChoice("notForMe")}>
            👎 {t("mysteryBook.feedback.notForMe")}
          </button>
        </div>

        {feedbackChoice && (
          <>
            <p style={{ fontWeight: 600, marginBottom: 12 }}>
              {t(
                feedbackChoice === "notForMe"
                  ? "mysteryBook.feedback.whatDidYouDislike"
                  : "mysteryBook.feedback.whatDidYouLike",
              )}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 24 }}>
              {FEEDBACK_TAGS.map((tag) => {
                const selected = feedbackTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setFeedbackTags((prev) => (selected ? prev.filter((x) => x !== tag) : [...prev, tag]))
                    }
                    style={{
                      padding: "6px 14px",
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      background: selected ? "var(--sage-100)" : "var(--surface)",
                      border: `1px solid ${selected ? "var(--forest-800)" : "var(--border)"}`,
                      color: selected ? "var(--forest-900)" : "var(--text)",
                    }}
                  >
                    {t(`mysteryBook.feedback.options.${tag}`)}
                  </button>
                );
              })}
            </div>
            <button type="button" className="btn btn-primary" onClick={handleSubmitFeedback}>
              {t("mysteryBook.feedback.submit")}
            </button>
          </>
        )}
      </div>
    );
  }

  // ---------- Feedback thank you / learning loop (13.21) ----------
  if (step === "feedbackDone") {
    return (
      <div className="empty-state">
        <div className="empty-state__illustration" aria-hidden="true">
          🧭
        </div>
        <h2 className="empty-state__title">{t("mysteryBook.feedback.thanksTitle")}</h2>
        <p className="empty-state__subtitle">{t("mysteryBook.feedback.thanksSubtitle")}</p>
        <button type="button" className="btn btn-primary" onClick={resetFlow}>
          {t("mysteryBook.feedback.startAnother")}
        </button>
      </div>
    );
  }

  return null;
}

// ---------- Shared small pieces ----------

function BackButton({ onBack, standalone }: { onBack: () => void; standalone?: boolean }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onBack}
      aria-label={t("common.back")}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "50%",
        cursor: "pointer",
        color: "var(--text-h)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        flexShrink: 0,
        marginBottom: standalone ? 16 : 0,
      }}
    >
      <BackIcon width={24} height={24} />
    </button>
  );
}

function StepHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 8 }}>
      {onBack && <BackButton onBack={onBack} />}
      <h1 style={{ color: "var(--text-h)", margin: 0 }}>{title}</h1>
    </div>
  );
}

function QuizShell({
  title,
  subtitle,
  onBack,
  children,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
      <StepHeader title={title} onBack={onBack} />
      {subtitle && <p style={{ color: "var(--text-muted)", marginTop: 8 }}>{subtitle}</p>}
      {children}
    </div>
  );
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, margin: "24px 0" }}>
      {children}
    </div>
  );
}

function ToggleCard({
  selected,
  disabled,
  onClick,
  emoji,
  label,
  description,
  title,
  tone = "forest",
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  emoji?: string;
  label: string;
  description?: string;
  title?: string;
  tone?: "forest" | "plum";
}) {
  const selectedBg = tone === "plum" ? "var(--plum-100)" : "var(--sage-100)";
  const selectedBorder = tone === "plum" ? "var(--plum-700)" : "var(--forest-800)";
  const selectedText = tone === "plum" ? "var(--plum-900)" : "var(--forest-900)";
  const button = (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: description ? "column" : "row",
        alignItems: description ? "flex-start" : "center",
        gap: description ? 4 : 10,
        padding: "14px 16px",
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        textAlign: "left",
        background: selected ? selectedBg : "var(--surface)",
        border: `1.5px solid ${selected ? selectedBorder : "var(--border)"}`,
        color: selected ? selectedText : "var(--text-h)",
        opacity: disabled ? 0.4 : 1,
        width: "100%",
      }}
    >
      <span>
        {emoji && (
          <span style={{ marginRight: 8 }} aria-hidden="true">
            {emoji}
          </span>
        )}
        {label}
      </span>
      {description && <span style={{ fontWeight: 400, fontSize: 13, opacity: 0.8 }}>{description}</span>}
    </button>
  );

  if (!title) return button;

  return (
    <div className="tooltip-trigger" style={{ width: "100%" }}>
      {button}
      <span className="tooltip-bubble" role="tooltip">
        {title}
      </span>
    </div>
  );
}

function LevelCard({
  emoji,
  label,
  description,
  selected,
  tone,
  onClick,
}: {
  emoji: string;
  label: string;
  description: string;
  selected: boolean;
  tone: "plum" | "forest";
  onClick: () => void;
}) {
  const bg = tone === "plum" ? "var(--plum-100)" : "var(--sage-100)";
  const border = tone === "plum" ? "var(--plum-300)" : "var(--forest-600)";
  const iconColor = tone === "plum" ? "var(--plum-700)" : "var(--forest-800)";
  const headingColor = tone === "plum" ? "var(--plum-900)" : "var(--forest-900)";
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: "left",
        padding: 24,
        borderRadius: 16,
        cursor: "pointer",
        background: selected ? bg : "var(--surface)",
        border: `2px solid ${selected ? border : "var(--border)"}`,
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 10, color: selected ? iconColor : "var(--text-muted)" }} aria-hidden="true">
        {emoji}
      </div>
      <div style={{ fontWeight: 700, color: selected ? headingColor : "var(--text-h)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{description}</div>
    </button>
  );
}

function AddressField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="form-field">
      <label className="form-field__label">{label}</label>
      <input
        className={error ? "form-field__input form-field__input--error" : "form-field__input"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="form-field__error">{error}</p>}
    </div>
  );
}

const PHONE_PREFIX = "+374";

function PhoneField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const digits = value.startsWith(PHONE_PREFIX) ? value.slice(PHONE_PREFIX.length) : value.replace(/\D/g, "");
  return (
    <div className="form-field">
      <label className="form-field__label">{label}</label>
      <div style={{ display: "flex", gap: 8 }}>
        <div
          className="form-field__input"
          style={{ width: 64, flexShrink: 0, textAlign: "center", background: "var(--ivory-100)", color: "var(--text-muted)" }}
        >
          {PHONE_PREFIX}
        </div>
        <input
          className={error ? "form-field__input form-field__input--error" : "form-field__input"}
          style={{ flex: 1 }}
          value={digits}
          inputMode="numeric"
          maxLength={6}
          placeholder="XXXXXX"
          onChange={(e) => onChange(PHONE_PREFIX + e.target.value.replace(/\D/g, "").slice(0, 6))}
        />
      </div>
      {error && <p className="form-field__error">{error}</p>}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "4px 0", color: "var(--text-muted)" }}>
      <span>{label}</span>
      <span style={{ color: "var(--text-h)" }}>{value}</span>
    </div>
  );
}

function StatusCard({ t }: { t: (key: string) => string }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: 12,
        padding: 16,
        maxWidth: 320,
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        fontSize: 13,
        fontWeight: 600,
        color: "var(--success)",
      }}
    >
      <span>{t("mysteryBook.confirmation.statusPreparing")}</span>
      <span style={{ color: "var(--text-muted)" }}>→</span>
      <span style={{ color: "var(--text-muted)" }}>{t("mysteryBook.confirmation.statusShipped")}</span>
      <span style={{ color: "var(--text-muted)" }}>→</span>
      <span style={{ color: "var(--text-muted)" }}>{t("mysteryBook.confirmation.statusDelivered")}</span>
    </div>
  );
}
