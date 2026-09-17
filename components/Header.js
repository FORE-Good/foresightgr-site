import { INTRO_CALL_LINK } from "@/lib/site";

export default function Header() {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <a href="#top" className="logo">
          <picture>
            <source media="(max-width: 700px)" srcSet="/assets/logo-mark.png" />
            <img
              src="/assets/logo-horizontal.jpg"
              alt="FOREsight by FORE Good"
            />
          </picture>
        </a>
        <div className="header-right">
          <nav className="header-nav">
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>
          <a
            className="btn btn-accent btn-small header-cta"
            href={INTRO_CALL_LINK}
            target="_blank"
            rel="noopener"
          >
            Book a<span className="header-cta-extra"> free intro</span> call
          </a>
        </div>
      </div>
    </header>
  );
}
