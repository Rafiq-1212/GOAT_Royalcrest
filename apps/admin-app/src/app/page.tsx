"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import { Submission } from "../types/lead";
import styles from "./page.module.css";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loginEmail, setLoginEmail] = useState<string>("adminassets@gmail.com");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterIntent, setFilterIntent] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterBudget, setFilterBudget] = useState<string>("ALL");
  const [filterTimeline, setFilterTimeline] = useState<string>("ALL");
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [deleteConfirmSub, setDeleteConfirmSub] = useState<Submission | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string>("");

  // Check existing session on load
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          return;
        }
      }
    } catch (err) {
      console.warn("Session check fallback:", err);
    }
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Fetch real submissions from Neon database via Prisma API
  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/submissions");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const dbSubs: Submission[] = json.data.map((d: any) => ({
            id: d.id,
            fullName: d.fullName,
            email: d.email,
            phone: d.phone,
            buyingIntent: d.buyingIntent,
            propertyType: d.propertyType,
            budget: d.budget,
            timeline: d.timeline,
            submittedAt: d.createdAt
              ? new Date(d.createdAt).toISOString().replace("T", " ").slice(0, 16)
              : new Date().toISOString().replace("T", " ").slice(0, 16),
          }));
          setSubmissions(dbSubs);
          setIsLoading(false);
          return;
        }
      } else if (res.status === 401) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Neon DB API fetch fallback:", err);
    }

    // Client localStorage fallback
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("goat_assets_submissions");
        if (stored) {
          const parsed: Submission[] = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setSubmissions(parsed);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Fallback safely
      }
    }

    setSubmissions([]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubmissions();
    }
  }, [isAuthenticated, fetchSubmissions]);

  // Login handler with bcrypt verification API
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setLoginPassword("");
        fetchSubmissions();
      } else {
        setLoginError(data.message || "Invalid username or password.");
      }
    } catch {
      setLoginError("Connection failed. Please verify the admin server is running.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setSubmissions([]);
  };

  // Delete submission handler
  const handleDeleteSubmission = async () => {
    if (!deleteConfirmSub) return;
    setIsDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/submissions?id=${encodeURIComponent(deleteConfirmSub.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSubmissions((prev) => prev.filter((s) => s.id !== deleteConfirmSub.id));
        if (selectedSub && selectedSub.id === deleteConfirmSub.id) {
          setSelectedSub(null);
        }

        // Synchronize localStorage fallback
        if (typeof window !== "undefined") {
          try {
            const stored = localStorage.getItem("goat_assets_submissions");
            if (stored) {
              const parsed: Submission[] = JSON.parse(stored);
              const updated = parsed.filter((s) => s.id !== deleteConfirmSub.id);
              localStorage.setItem("goat_assets_submissions", JSON.stringify(updated));
            }
          } catch {
            // ignore
          }
        }

        setDeleteConfirmSub(null);
      } else {
        setDeleteError(data.error || "Failed to delete submission.");
      }
    } catch (err: any) {
      setDeleteError(err.message || "Network error while deleting submission.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter submissions by search and question responses
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        sub.fullName.toLowerCase().includes(q) ||
        sub.email.toLowerCase().includes(q) ||
        sub.phone.includes(searchQuery);

      const matchesIntent =
        filterIntent === "ALL" ||
        sub.buyingIntent.toLowerCase().includes(filterIntent.toLowerCase()) ||
        filterIntent.toLowerCase().includes(sub.buyingIntent.toLowerCase());

      const matchesType =
        filterType === "ALL" ||
        sub.propertyType.toLowerCase().includes(filterType.toLowerCase());

      const matchesBudget =
        filterBudget === "ALL" ||
        sub.budget.includes(filterBudget) ||
        filterBudget.includes(sub.budget.split("(")[0].trim());

      const matchesTimeline =
        filterTimeline === "ALL" ||
        sub.timeline.toLowerCase().includes(filterTimeline.toLowerCase()) ||
        filterTimeline.toLowerCase().includes(sub.timeline.toLowerCase());

      return matchesSearch && matchesIntent && matchesType && matchesBudget && matchesTimeline;
    });
  }, [submissions, searchQuery, filterIntent, filterType, filterBudget, filterTimeline]);

  // Export to CSV with landing page question headers
  const handleExportCSV = () => {
    const headers = [
      "Submission ID",
      "Full Name",
      "Email Address",
      "Phone Number",
      "Q1: Why are you buying?",
      "Q2: Which property type?",
      "Q3: What's your budget?",
      "Q4: When do you want to buy?",
      "Submitted At"
    ];

    const rows = filteredSubmissions.map((s) => [
      s.id,
      `"${s.fullName.replace(/"/g, '""')}"`,
      `"${s.email.replace(/"/g, '""')}"`,
      `"${s.phone.replace(/"/g, '""')}"`,
      `"${s.buyingIntent.replace(/"/g, '""')}"`,
      `"${s.propertyType.replace(/"/g, '""')}"`,
      `"${s.budget.replace(/"/g, '""')}"`,
      `"${s.timeline.replace(/"/g, '""')}"`,
      `"${s.submittedAt}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `goat_assets_landing_submissions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilterIntent("ALL");
    setFilterType("ALL");
    setFilterBudget("ALL");
    setFilterTimeline("ALL");
  };

  // Initial loading state while checking session cookie
  if (isAuthenticated === null) {
    return (
      <div className={styles.sessionLoadingScreen}>
        <div className={styles.sessionSpinner} />
        <span>Verifying Goat Assets admin session...</span>
      </div>
    );
  }

  // Render Login Card if unauthenticated
  if (!isAuthenticated) {
    return (
      <div className={styles.loginWrapper}>
        <div className={styles.loginCard}>
          <Image
            src="/Goatlogo.png"
            alt="Goat Assets Dubai"
            width={170}
            height={52}
            priority
            className={styles.loginLogo}
          />

          <span className={styles.loginSecurityBadge}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Secure Admin Portal
          </span>

          <h1 className={styles.loginTitle}>Admin Sign In</h1>
          <p className={styles.loginSubtitle}>
            Enter your credentials to access the Dubai real estate investor dashboard.
          </p>

          <form onSubmit={handleLogin} className={styles.loginForm}>
            {loginError && (
              <div className={styles.loginErrorAlert}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{loginError}</span>
              </div>
            )}

            <div className={styles.loginFieldGroup}>
              <label htmlFor="admin-email" className={styles.loginFieldLabel}>
                Username / Email
              </label>
              <div className={styles.loginInputWrapper}>
                <span className={styles.loginInputIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="adminassets@gmail.com"
                  className={styles.loginInput}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className={styles.loginFieldGroup}>
              <label htmlFor="admin-password" className={styles.loginFieldLabel}>
                Password
              </label>
              <div className={styles.loginInputWrapper}>
                <span className={styles.loginInputIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  className={styles.loginInput}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggleBtn}
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className={styles.loginSubmitBtn}
            >
              {isLoggingIn ? (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className={styles.spinning}
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className={styles.loginFooterNote}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Protected with bcrypt encryption • Goat Assets Dubai</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminWrapper}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.brandGroup}>
          <Image
            src="/Goatlogo.png"
            alt="Goat Assets Dubai"
            width={160}
            height={48}
            priority
            className={styles.brandLogo}
          />
          <div className={styles.pageHeading}>
            Landing Page Questionnaire Submissions
            <span className={styles.countPill}>
              {isLoading ? "Loading..." : `${filteredSubmissions.length} Submissions`}
            </span>
          </div>
        </div>

        <div className={styles.headerActions}>
          <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className={styles.landingLink}>
            Open Landing Page ↗
          </a>

          <button
            type="button"
            className={styles.refreshBtn}
            onClick={fetchSubmissions}
            disabled={isLoading}
            title="Refresh submissions from database"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={isLoading ? styles.spinning : ""}
            >
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>

          <button
            type="button"
            className={styles.exportBtn}
            onClick={handleExportCSV}
            disabled={filteredSubmissions.length === 0}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>

          <button
            type="button"
            className={styles.logoutBtn}
            onClick={handleLogout}
            title="Sign out of Admin Portal"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className={styles.mainContainer}>
        {/* SUMMARY OF THE 4 LANDING PAGE QUESTIONS */}
        <div className={styles.questionsSummaryGrid}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryQuestionNumber}>Question 1</span>
            <span className={styles.summaryQuestionText}>Why are you buying?</span>
            <div className={styles.summaryTopAnswer}>
              <span>Investor distribution</span>
              <span className={styles.summaryTopBadge}>
                {submissions.filter((s) => s.buyingIntent.toLowerCase().includes("invest")).length} Invest • {submissions.filter((s) => s.buyingIntent.toLowerCase().includes("live")).length} Live in
              </span>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <span className={styles.summaryQuestionNumber}>Question 2</span>
            <span className={styles.summaryQuestionText}>Which property type?</span>
            <div className={styles.summaryTopAnswer}>
              <span>Type distribution</span>
              <span className={styles.summaryTopBadge}>
                {submissions.filter((s) => s.propertyType === "Apartment").length} Apt • {submissions.filter((s) => s.propertyType === "Villa").length} Villa • {submissions.filter((s) => s.propertyType === "Penthouse").length} Penthouse
              </span>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <span className={styles.summaryQuestionNumber}>Question 3</span>
            <span className={styles.summaryQuestionText}>What’s your budget?</span>
            <div className={styles.summaryTopAnswer}>
              <span>Budget focus</span>
              <span className={styles.summaryTopBadge}>
                {submissions.filter((s) => s.budget.includes("Over AED 5") || s.budget.includes("2–5")).length} AED 2M+ tier
              </span>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <span className={styles.summaryQuestionNumber}>Question 4</span>
            <span className={styles.summaryQuestionText}>When do you want to buy?</span>
            <div className={styles.summaryTopAnswer}>
              <span>Timeline focus</span>
              <span className={styles.summaryTopBadge}>
                {submissions.filter((s) => s.timeline.toLowerCase().includes("immediately") || s.timeline.toLowerCase().includes("3 months")).length} Immediate / 3 mo
              </span>
            </div>
          </div>
        </div>

        {/* FILTERS BY LANDING PAGE QUESTIONS */}
        <div className={styles.toolbarCard}>
          <div className={styles.searchBox}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            {/* Filter Q1 */}
            <select
              className={styles.selectInput}
              value={filterIntent}
              onChange={(e) => setFilterIntent(e.target.value)}
              title="Filter by Question 1: Why are you buying?"
            >
              <option value="ALL">Q1: All Purposes</option>
              <option value="To live in">To live in</option>
              <option value="To invest">To invest</option>
              <option value="Other / Flexible">Other / Flexible</option>
            </select>

            {/* Filter Q2 */}
            <select
              className={styles.selectInput}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              title="Filter by Question 2: Which property type?"
            >
              <option value="ALL">Q2: All Property Types</option>
              <option value="Apartment">Apartment</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Villa">Villa</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Other">Other</option>
            </select>

            {/* Filter Q3 */}
            <select
              className={styles.selectInput}
              value={filterBudget}
              onChange={(e) => setFilterBudget(e.target.value)}
              title="Filter by Question 3: What's your budget?"
            >
              <option value="ALL">Q3: All Budgets</option>
              <option value="Under AED 1 million">Under AED 1M (Under ₹2.3 Cr)</option>
              <option value="AED 1–2 million">AED 1–2M (₹2.3 Cr – ₹4.6 Cr)</option>
              <option value="AED 2–5 million">AED 2–5M (₹4.6 Cr – ₹11.5 Cr)</option>
              <option value="Over AED 5 million">Over AED 5M (Above ₹11.5 Cr)</option>
            </select>

            {/* Filter Q4 */}
            <select
              className={styles.selectInput}
              value={filterTimeline}
              onChange={(e) => setFilterTimeline(e.target.value)}
              title="Filter by Question 4: When do you want to buy?"
            >
              <option value="ALL">Q4: All Timelines</option>
              <option value="Immediately">Immediately</option>
              <option value="Within 3 months">Within 3 months</option>
              <option value="Within 6 months">Within 6 months</option>
              <option value="Other / Flexible">Other / Flexible</option>
            </select>

            {(searchQuery || filterIntent !== "ALL" || filterType !== "ALL" || filterBudget !== "ALL" || filterTimeline !== "ALL") && (
              <button type="button" className={styles.clearFilterBtn} onClick={resetFilters}>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* SUBMISSIONS TABLE */}
        <div className={styles.tableContainer}>
          <div className={styles.tableHeaderRow}>
            <span className={styles.tableTitle}>Questionnaire Responses</span>
          </div>

          <div className={styles.tableWrapper}>
            {isLoading ? (
              <div className={styles.emptyState}>
                <p>Connecting to database & loading submissions...</p>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className={styles.emptyState}>
                {submissions.length === 0 ? (
                  <div>
                    <p style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
                      No submissions yet
                    </p>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                      Submissions from the landing page questionnaire funnel will appear here in real time.
                    </p>
                  </div>
                ) : (
                  <p>No submissions match the current filters.</p>
                )}
              </div>
            ) : (
              <table className={styles.submissionsTable}>
                <thead>
                  <tr>
                    <th>Submission</th>
                    <th>Investor (Step 5)</th>
                    <th>Q1: Why Buying?</th>
                    <th>Q2: Property Type</th>
                    <th>Q3: Budget</th>
                    <th>Q4: Timeline</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((sub) => (
                    <tr key={sub.id} className={styles.tableRow}>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                          <span className={styles.submissionId}>{sub.id}</span>
                          <span className={styles.submissionDate}>{sub.submittedAt}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.investorCell}>
                          <span className={styles.investorName}>{sub.fullName}</span>
                          <span className={styles.investorContact}>{sub.phone}</span>
                          <span className={styles.investorContact}>{sub.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.answerPill}>{sub.buyingIntent}</span>
                      </td>
                      <td>
                        <span className={styles.answerPill}>{sub.propertyType}</span>
                      </td>
                      <td>
                        <span className={styles.budgetValue}>{sub.budget}</span>
                      </td>
                      <td>
                        <span className={styles.answerPill}>{sub.timeline}</span>
                      </td>
                      <td>
                        <div className={styles.actionCell}>
                          {/* WhatsApp Direct Chat */}
                          <a
                            href={`https://wa.me/${sub.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(sub.fullName)},%20this%20is%20Goat%20Assets%20Dubai%20regarding%20your%20property%20preference%20for%20${encodeURIComponent(sub.propertyType)}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${styles.actionIconBtn} ${styles.actionIconBtnWhatsapp}`}
                            title="Chat on WhatsApp"
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.588-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.941-.708-1.792s.448-1.272.607-1.446c.159-.175.346-.219.462-.219s.231.002.332.008c.107.007.25.04.389.375.144.346.491 1.2.534 1.288.043.088.072.19.014.305-.058.115-.087.188-.173.289l-.26.305c-.087.087-.179.181-.077.355.101.174.45 1.741 1.741 1.741.42 0 .664-.173.766-.319.102-.146.433-.564.549-.752.116-.188.232-.16.39-.102.16.058 1.012.477 1.185.564.173.087.289.13.332.203.043.072.043.419-.101.824z" />
                            </svg>
                          </a>

                          {/* Email */}
                          <a
                            href={`mailto:${sub.email}?subject=Goat Assets Dubai Investment Consultation`}
                            className={styles.actionIconBtn}
                            title="Send Email"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                              <polyline points="22,6 12,13 2,6" />
                            </svg>
                          </a>

                          {/* View All Answers Modal */}
                          <button
                            type="button"
                            className={styles.viewDetailsBtn}
                            onClick={() => setSelectedSub(sub)}
                          >
                            View
                          </button>

                          {/* Delete Submission Button */}
                          <button
                            type="button"
                            className={`${styles.actionIconBtn} ${styles.actionIconBtnDelete}`}
                            onClick={() => {
                              setDeleteError("");
                              setDeleteConfirmSub(sub);
                            }}
                            title="Delete Submission"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* SUBMISSION DETAILS MODAL */}
      {selectedSub && (
        <div className={styles.modalOverlay} onClick={() => setSelectedSub(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>{selectedSub.fullName}</h3>
                <span className={styles.submissionId}>{selectedSub.id} • Submitted {selectedSub.submittedAt}</span>
              </div>
              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={() => setSelectedSub(null)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div>
                <div className={styles.sectionTitle}>Contact Details (Step 5)</div>
                <div className={styles.detailGrid}>
                  <div className={styles.detailBox}>
                    <div className={styles.detailLabel}>Full Name</div>
                    <div className={styles.detailValue}>{selectedSub.fullName}</div>
                  </div>
                  <div className={styles.detailBox}>
                    <div className={styles.detailLabel}>Email Address</div>
                    <div className={styles.detailValue}>{selectedSub.email}</div>
                  </div>
                  <div className={styles.detailBox} style={{ gridColumn: "1 / -1" }}>
                    <div className={styles.detailLabel}>Mobile Number</div>
                    <div className={styles.detailValue}>{selectedSub.phone}</div>
                  </div>
                </div>
              </div>

              <div>
                <div className={styles.sectionTitle}>Questionnaire Responses (Steps 1–4)</div>
                <div className={styles.detailGrid}>
                  <div className={styles.detailBox}>
                    <div className={styles.detailLabel}>Q1: Why are you buying?</div>
                    <div className={styles.detailValue}>{selectedSub.buyingIntent}</div>
                  </div>

                  <div className={styles.detailBox}>
                    <div className={styles.detailLabel}>Q2: Which property type?</div>
                    <div className={styles.detailValue}>{selectedSub.propertyType}</div>
                  </div>

                  <div className={styles.detailBox}>
                    <div className={styles.detailLabel}>Q3: What’s your budget?</div>
                    <div className={styles.budgetValue}>{selectedSub.budget}</div>
                  </div>

                  <div className={styles.detailBox}>
                    <div className={styles.detailLabel}>Q4: When do you want to buy?</div>
                    <div className={styles.detailValue}>{selectedSub.timeline}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                <a
                  href={`https://wa.me/${selectedSub.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(selectedSub.fullName)},%20this%20is%20Goat%20Assets%20Dubai.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.exportBtn}
                  style={{ textDecoration: "none" }}
                >
                  Chat on WhatsApp
                </a>
                <a
                  href={`mailto:${selectedSub.email}?subject=Goat Assets Dubai Investment Consultation`}
                  className={styles.refreshBtn}
                  style={{ textDecoration: "none" }}
                >
                  Send Email
                </a>
                <button
                  type="button"
                  className={styles.modalDeleteBtn}
                  onClick={() => {
                    const subToDelete = selectedSub;
                    setDeleteError("");
                    setDeleteConfirmSub(subToDelete);
                  }}
                  title="Delete this lead"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Delete
                </button>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setSelectedSub(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmSub && (
        <div className={styles.modalOverlay} onClick={() => !isDeleting && setDeleteConfirmSub(null)}>
          <div className={styles.deleteModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteModalIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>

            <h3 className={styles.deleteModalTitle}>Delete Submission</h3>
            <p className={styles.deleteModalText}>
              Are you sure you want to permanently delete this submission? This action cannot be undone.
            </p>

            <div className={styles.deleteTargetCard}>
              <div className={styles.deleteTargetName}>{deleteConfirmSub.fullName}</div>
              <div className={styles.deleteTargetMeta}>
                <span>{deleteConfirmSub.email}</span>
                <span>•</span>
                <span>{deleteConfirmSub.phone}</span>
              </div>
              <div className={styles.deleteTargetMeta} style={{ marginTop: "0.2rem", fontSize: "0.78rem" }}>
                <span>ID: {deleteConfirmSub.id}</span>
                <span>•</span>
                <span>Submitted: {deleteConfirmSub.submittedAt}</span>
              </div>
            </div>

            {deleteError && (
              <div className={styles.deleteErrorAlert}>
                {deleteError}
              </div>
            )}

            <div className={styles.deleteModalActions}>
              <button
                type="button"
                className={styles.deleteCancelBtn}
                onClick={() => setDeleteConfirmSub(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.deleteConfirmBtn}
                onClick={handleDeleteSubmission}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className={styles.loginSpinner} style={{ width: 16, height: 16 }} />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
