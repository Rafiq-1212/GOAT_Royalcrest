"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import SurveyView from "./components/SurveyView";

export default function Home() {
  const [showSurvey, setShowSurvey] = useState(false);

  // If survey view is active, render the multi-step questionnaire
  if (showSurvey) {
    return <SurveyView onClose={() => setShowSurvey(false)} />;
  }

  return (
    <div className={styles.pageWrapper}>
      {/* Floating Card Header */}
      <div className={styles.headerWrapper}>
        <header className={styles.headerCard}>
          <a href="#" className={styles.brand}>
            <Image
              src="/Goatlogo.png"
              alt="Goat Assets Dubai"
              width={180}
              height={52}
              priority
              className={styles.brandLogo}
            />
          </a>

          <button
            type="button"
            className={styles.headerCtaBtn}
            onClick={() => setShowSurvey(true)}
          >
            <span>Invest in Dubai</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </button>
        </header>
      </div>

      {/* Hero Ambient Background with Left Clear & Right Gradient */}
      <div className={styles.heroBackground} aria-hidden="true">
        <Image
          src="/Dubai background.png"
          alt="Dubai Skyline Ambient Background"
          fill
          priority
          sizes="100vw"
          quality={85}
          className={styles.heroBgImage}
        />
        <div className={styles.heroBgOverlay} />
      </div>

      {/* Main Hero Section */}
      <main className={styles.heroSection}>
        {/* Left Column: Typography, Points & Single CTA */}
        <div className={styles.heroLeft}>
          <h1 className={styles.heroTitle}>
            Build <span className={styles.goldText}>Long-Term Wealth</span>{" "}
            <br className={styles.desktopBr} />
            Through Dubai Real Estate
          </h1>

          {/* Mobile Card Image (placed directly below heading on mobile) */}
          <div className={styles.mobileImageCard} aria-hidden="true">
            <div className={styles.imageCardInner}>
              <Image
                src="/dubai.jpg"
                alt="Dubai Prime Skyline - Goat Assets"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 550px"
                quality={90}
                className={styles.cardImage}
              />
              <div className={styles.glassOverlayBottomLeft}>
                <span className={styles.glassStatVal}>7–10% Net Yields</span>
                <span className={styles.glassStatLabel}>Tax-free income</span>
              </div>
              <div className={styles.glassOverlayBottomRight}>
                <span className={styles.glassStatRightVal}>10-Yr Golden Visa</span>
                <span className={styles.glassStatRightLabel}>AED 2M+ Qualified</span>
              </div>
            </div>
          </div>

          <p className={styles.heroSubtitle}>
            Explore high-ROI properties in Dubai, offering tax-free investment benefits, flexible payment plans, and opportunities designed for long-term wealth creation and financial security.
          </p>

          <ul className={styles.pointsGrid}>
            <li className={styles.pointItem}>
              <span className={styles.pointCheck}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className={styles.pointText}>Zero-Tax Investment</span>
            </li>
            <li className={styles.pointItem}>
              <span className={styles.pointCheck}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className={styles.pointText}>High Rental Returns (7–10%)</span>
            </li>
            <li className={styles.pointItem}>
              <span className={styles.pointCheck}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className={styles.pointText}>Proven Capital Appreciation (4–6%)</span>
            </li>
            <li className={styles.pointItem}>
              <span className={styles.pointCheck}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className={styles.pointText}>Safe & Transparent Market</span>
            </li>
            <li className={styles.pointItem}>
              <span className={styles.pointCheck}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className={styles.pointText}>10-Year Golden Visa</span>
            </li>
            <li className={styles.pointItem}>
              <span className={styles.pointCheck}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className={styles.pointText}>20K+ Global Investors</span>
            </li>
          </ul>

          <div className={styles.ctaWrapper}>
            <button
              id="hero-invest-btn"
              type="button"
              className={styles.primaryBtn}
              onClick={() => setShowSurvey(true)}
            >
              <span>Invest in Dubai</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Column: Rounded Card with Ambient Badges for Dubai Image */}
        <div className={styles.heroRight}>
          <div className={styles.imageCard}>
            <Image
              src="/dubai.jpg"
              alt="Dubai Prime Skyline - Goat Assets"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 550px"
              quality={92}
              className={styles.cardImage}
            />

            {/* Floating Glass Overlay Badges */}

            <div className={styles.glassOverlayBottomLeft}>
              <span className={styles.glassStatVal}>7–10% Net Yields</span>
              <span className={styles.glassStatLabel}>Tax-free rental income</span>
            </div>

            <div className={styles.glassOverlayBottomRight}>
              <span className={styles.glassStatRightVal}>10-Yr Golden Visa</span>
              <span className={styles.glassStatRightLabel}>AED 2M+ Qualified</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
