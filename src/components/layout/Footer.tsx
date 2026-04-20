import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <span className="site-footer-logo">
            ATLA<span className="site-footer-logo-s">S</span>
          </span>
          <p className="site-footer-tagline">
            Recommandations de voyage fondées sur votre profil.
          </p>
        </div>

        <nav className="site-footer-nav" aria-label="Navigation secondaire">
          <Link href="/" className="site-footer-link">Explorer</Link>
          <Link href="/quiz" className="site-footer-link">Trouver mon voyage</Link>
        </nav>

        <p className="site-footer-copy">© 2026 Atlas</p>
      </div>
    </footer>
  );
}
