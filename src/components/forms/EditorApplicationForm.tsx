"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export function EditorApplicationForm() {
  const locale = useLocale();
  const isRtl = locale === "ps" || locale === "fa";

  const allLabels = {
    en: {
      name: "Full Name",
      namePlaceholder: "e.g. Ahmad Karimi",
      email: "Email Address",
      emailPlaceholder: "name@example.com",
      password: "Password",
      passwordHint: "At least 12 characters, including letters and numbers",
      confirmPassword: "Confirm Password",
      bio: "Short Biography (Optional)",
      bioPlaceholder: "Tell readers about your background and areas of interest...",
      reason: "Why do you want to join Beyond Rasooli? (Optional)",
      reasonPlaceholder: "Share your editorial background or research interests...",
      submit: "Submit Application",
      submitting: "Submitting Application...",
      successTitle: "Application Submitted Successfully",
      successBody:
        "Thank you for applying to become an Editor at Beyond Rasooli. Your application has been recorded in a pending state. The founder reviews every application before granting access to the editorial dashboard.",
      backHome: "Return to Homepage",
      loginNote: "Already an approved editor?",
      loginLink: "Sign in to Admin Dashboard",
    },
    ps: {
      name: "بشپړ نوم",
      namePlaceholder: "لکه: احمد کریمي",
      email: "برېښنالیک پته",
      emailPlaceholder: "name@example.com",
      password: "پټنوم (پاسورډ)",
      passwordHint: "لږترلږه ۱۲ توري، باید توري او شمېرې دواړه ولري",
      confirmPassword: "د پټنوم تایید",
      bio: "لنډه پېژندنه (اختیاري)",
      bioPlaceholder: "د خپلې مخینې او علمي لېوالتیا په اړه ولیکئ...",
      reason: "ولې غواړئ له بیاند رسولي سره یوځای شئ؟ (اختیاري)",
      reasonPlaceholder: "خپله لیکوالۍ یا څېړنیزه مخینه بیان کړئ...",
      submit: "غوښتنلیک ولېږئ",
      submitting: "غوښتنلیک استول کېږي...",
      successTitle: "غوښتنلیک په بریالیتوب سره ثبت شو",
      successBody:
        "له بیاند رسولي سره د لیکوال/ایډیټر په توګه ستاسو د لېوالتیا مننه. ستاسو غوښتنلیک د بیاکتنې په حالت کې ثبت شو. بنسټ ایښودونکی د هرې غوښتنې تر کتنې وروسته اداري لاسرسی ورکوي.",
      backHome: "اصلي پاڼې ته بېرته ستنېدل",
      loginNote: "ایا مخکې تایید شوی ایډیټر یاست؟",
      loginLink: "ادارې ته ننوځئ",
    },
    fa: {
      name: "نام کامل",
      namePlaceholder: "مثلاً: احمد کریمی",
      email: "آدرس ایمیل",
      emailPlaceholder: "name@example.com",
      password: "رمز عبور",
      passwordHint: "حداقل ۱۲ حرف، شامل حروف و اعداد",
      confirmPassword: "تأیید رمز عبور",
      bio: "زندگی‌نامه کوتاه (اختیاری)",
      bioPlaceholder: "درباره پیشینه و زمینه‌های علاقه‌مندی خود بنویسید...",
      reason: "چرا می‌خواهید به فراتر از رسولی بپیوندید؟ (اختیاری)",
      reasonPlaceholder: "پیشینه نویسندگی یا پژوهشی خود را بنویسید...",
      submit: "ارسال درخواست",
      submitting: "در حال ارسال درخواست...",
      successTitle: "درخواست با موفقیت ثبت شد",
      successBody:
        "از ابراز علاقه شما برای پیوستن به عنوان ویراستار در فراتر از رسولی سپاسگزاریم. درخواست شما در وضعیت انتظار ثبت شد. بنیان‌گذار پس از بررسی، دسترسی شما را به پنل تحریریه فعال خواهد کرد.",
      backHome: "بازگشت به صفحه اصلی",
      loginNote: "قبلاً تأیید شده‌اید؟",
      loginLink: "ورود به پنل مدیریت",
    },
  };

  const labels = allLabels[locale as "en" | "ps" | "fa"] || allLabels.en;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    bio: "",
    reasonForJoining: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
    if (serverError) setServerError("");
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name =
        locale === "ps"
          ? "مهرباني وکړئ بشپړ نوم دننه کړئ."
          : locale === "fa"
            ? "لطفاً نام کامل خود را وارد کنید."
            : "Please enter your full name (at least 2 characters).";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      errs.email =
        locale === "ps"
          ? "مهرباني وکړئ یو سم برېښنالیک دننه کړئ."
          : locale === "fa"
            ? "لطفاً یک آدرس ایمیل معتبر وارد کنید."
            : "Please enter a valid email address.";
    }

    if (formData.password.length < 12) {
      errs.password =
        locale === "ps"
          ? "پټنوم باید لږترلږه ۱۲ توري وي."
          : locale === "fa"
            ? "رمز عبور باید حداقل ۱۲ کاراکتر باشد."
            : "Password must be at least 12 characters long.";
    } else if (!/\p{L}/u.test(formData.password) || !/\p{N}/u.test(formData.password)) {
      errs.password =
        locale === "ps"
          ? "پټنوم باید توري او شمېرې دواړه ولري."
          : locale === "fa"
            ? "رمز عبور باید هم حروف و هم اعداد داشته باشد."
            : "Password must include both letters and numbers.";
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword =
        locale === "ps"
          ? "پټنومونه یو شان نه دي."
          : locale === "fa"
            ? "تأیید رمز عبور مطابقت ندارد."
            : "Password confirmation does not match.";
    }

    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const res = await fetch("/api/editor-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "An error occurred. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-8 sm:p-10 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm text-center max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-[var(--ink)]">
          {labels.successTitle}
        </h2>
        <p className="text-[var(--ink-muted)] leading-relaxed text-sm sm:text-base">
          {labels.successBody}
        </p>
        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[var(--ink)] text-[var(--bg)] font-medium text-sm transition hover:opacity-90"
          >
            {labels.backHome}
          </Link>
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--ink)] font-medium text-sm transition hover:bg-[var(--surface-hover)]"
          >
            {labels.loginLink}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-xl mx-auto p-6 sm:p-10 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-6"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {serverError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--ink)]">
          {labels.name} <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={labels.namePlaceholder}
          required
          className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-[var(--bg)] text-[var(--ink)] placeholder-[var(--ink-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--ink)] transition ${
            errors.name ? "border-rose-500" : "border-[var(--border)]"
          }`}
        />
        {errors.name && (
          <p className="text-xs text-rose-500 font-medium">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--ink)]">
          {labels.email} <span className="text-rose-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder={labels.emailPlaceholder}
          required
          className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-[var(--bg)] text-[var(--ink)] placeholder-[var(--ink-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--ink)] transition ${
            errors.email ? "border-rose-500" : "border-[var(--border)]"
          }`}
        />
        {errors.email && (
          <p className="text-xs text-rose-500 font-medium">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--ink)]">
          {labels.password} <span className="text-rose-500">*</span>
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-[var(--bg)] text-[var(--ink)] placeholder-[var(--ink-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--ink)] transition ${
            errors.password ? "border-rose-500" : "border-[var(--border)]"
          }`}
        />
        <p className="text-xs text-[var(--ink-muted)]">{labels.passwordHint}</p>
        {errors.password && (
          <p className="text-xs text-rose-500 font-medium">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--ink)]">
          {labels.confirmPassword} <span className="text-rose-500">*</span>
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-[var(--bg)] text-[var(--ink)] placeholder-[var(--ink-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--ink)] transition ${
            errors.confirmPassword ? "border-rose-500" : "border-[var(--border)]"
          }`}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-rose-500 font-medium">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Short Bio */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--ink)]">
          {labels.bio}
        </label>
        <textarea
          name="bio"
          rows={3}
          value={formData.bio}
          onChange={handleChange}
          placeholder={labels.bioPlaceholder}
          className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-[var(--bg)] text-[var(--ink)] placeholder-[var(--ink-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--ink)] transition"
        />
      </div>

      {/* Reason for Joining */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--ink)]">
          {labels.reason}
        </label>
        <textarea
          name="reasonForJoining"
          rows={3}
          value={formData.reasonForJoining}
          onChange={handleChange}
          placeholder={labels.reasonPlaceholder}
          className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-[var(--bg)] text-[var(--ink)] placeholder-[var(--ink-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--ink)] transition"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-6 rounded-xl bg-[var(--ink)] text-[var(--bg)] font-medium text-sm transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--ink)] flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{labels.submitting}</span>
          </>
        ) : (
          <span>{labels.submit}</span>
        )}
      </button>

      <div className="pt-2 text-center text-xs text-[var(--ink-muted)]">
        {labels.loginNote}{" "}
        <Link
          href="/admin/login"
          className="underline hover:text-[var(--ink)] transition font-medium"
        >
          {labels.loginLink}
        </Link>
      </div>
    </form>
  );
}
