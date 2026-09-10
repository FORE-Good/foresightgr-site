import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Pricing from "@/components/Pricing";
import Newsletter from "@/components/Newsletter";
import { INTRO_CALL_LINK, QUIZ_LINK } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <AnnouncementBar />
      <Header />

      <main id="top">
        <section className="hero">
          <div className="wrap">
            <h1>
              Become the organisation government can&apos;t ignore
            </h1>
            <p className="hero-sub">
              Tech and expertise to superpower your team
            </p>
            <div className="cta-row">
              <a
                className="btn btn-accent"
                href={INTRO_CALL_LINK}
                target="_blank"
                rel="noopener"
              >
                Book a free intro call
              </a>
              <a
                className="btn btn-outline-light"
                href={QUIZ_LINK}
                target="_blank"
                rel="noopener"
              >
                Take our readiness quiz
              </a>
            </div>
          </div>
        </section>

        <section className="section section-band problem rip">
          <div className="wrap narrow">
            <p className="eyebrow center">Why it matters</p>
            <h2>
              Every missed window costs funding, influence, or a seat at the
              table.
            </h2>
            <p className="lead">
              Funding rounds close. Consultations open and shut. Policy shifts
              without warning.
            </p>
          </div>
        </section>

        <section className="section features">
          <div className="wrap">
            <p className="eyebrow center">What you get</p>
            <h2 className="section-title">
              Build government relations capability
            </h2>
            <p className="section-sub lead">
              We give small teams big capabilities. Know what matters. Know
              what to do next.
            </p>

            <div className="feature-grid">
              <article className="feature-card">
                <img
                  src="/assets/feature-1.png"
                  alt="Policy intelligence dashboard"
                />
                <h3>Intelligence tool</h3>
                <p>
                  Personalised intelligence so you never miss another
                  opportunity.
                </p>
                <ul className="feature-detail">
                  <li>Find funding opportunities</li>
                  <li>Track sittings and consultations</li>
                  <li>Intel on parliament contacts</li>
                </ul>
              </article>
              <article className="feature-card">
                <img
                  src="/assets/feature-3.png"
                  alt="Advisory call"
                />
                <h3>Advisory</h3>
                <p>
                  Expert guidance to build strategy and learn how to achieve it.
                </p>
                <ul className="feature-detail">
                  <li>2 &times; 30 min calls a month</li>
                  <li>Walkthroughs and learning</li>
                  <li>Personalised support</li>
                </ul>
              </article>
              <article className="feature-card">
                <img
                  src="/assets/feature-2.png"
                  alt="Template library"
                />
                <h3>Action</h3>
                <p>
                  Get the capability to execute with our tools, templates and
                  workflows
                </p>
                <ul className="feature-detail">
                  <li>Prepare for ministerial briefings</li>
                  <li>Write budget asks</li>
                  <li>Find contacts</li>
                </ul>
              </article>
            </div>

            <div className="cta-row features-cta">
              <a
                className="btn btn-accent"
                href={INTRO_CALL_LINK}
                target="_blank"
                rel="noopener"
              >
                Book a free intro call
              </a>
            </div>
          </div>
        </section>

        <section className="section dont-get">
          <div className="wrap narrow">
            <h2 className="section-title">What you don&apos;t get</h2>
            <ul className="inclusions-list">
              <li className="excluded">
                24/7 support or formal uptime guarantees
              </li>
              <li className="excluded">
                Project work between calls - we don&apos;t take research,
                writing, analysis or operational tasks off your plate
              </li>
              <li className="excluded">
                Lobbying on your behalf - we equip you to engage government
                yourself
              </li>
              <li className="excluded">
                Open-ended advisory by email - strategic input lives inside the
                calls
              </li>
              <li className="excluded">
                Migration of data from other systems, unless scoped together up
                front
              </li>
              <li className="excluded">
                Custom features built on demand - we listen closely, but build
                to roadmap
              </li>
            </ul>
          </div>
        </section>

        <Pricing />

        <section className="section track-record rip rip-flip">
          <div className="wrap">
            <p className="eyebrow center eyebrow-light">Track record</p>
            <h2>You won&apos;t be figuring this out alone</h2>
            <p className="track-copy">
              FOREsight is built on FORE Good&apos;s track record: real briefs
              contributing to real world uptake and real relationships with MPs
              and staffers across the country.
            </p>
            <div className="stat-row">
              <div className="stat">
                <span className="stat-num">80+</span>
                <span className="stat-label">MP meetings since mid-April</span>
              </div>
              <div className="stat">
                <span className="stat-num">1,254+</span>
                <span className="stat-label">Organisations engaged</span>
              </div>
            </div>
            <img
              className="track-photo"
              src="/assets/testimonial-photo.jpg"
              alt="FORE Good team on the steps of Victorian Parliament"
            />
          </div>
        </section>

        <section className="section testimonial-trusted rip">
          <div className="wrap">
            <div className="testimonial-trusted-grid">
              <div className="testimonial">
                <blockquote>
                  &quot;FOREsight has been invaluable to help us figure out who
                  to talk to at different levels of government and what tenders
                  and grants to stay across. It&apos;s really helped us to
                  demystify the process and the team has been wonderful in
                  helping us to understand different templates and processes
                  that best suit a small team like ours.&quot;
                </blockquote>
                <p className="testimonial-attr">
                  &mdash; Cameron Cliff, Founder of the social enterprise
                  Capyble
                </p>
              </div>
              <div className="trusted">
                <p className="trusted-label">Trusted by</p>
                <div className="trusted-logos">
                  <img src="/assets/trusted-1.png" alt="Capyble" />
                  <img
                    src="/assets/trusted-2.png"
                    alt="Physical Disability Australia"
                  />
                  <img src="/assets/trusted-3.png" alt="Ecomind" />
                  <img src="/assets/trusted-4.png" alt="Climate Writers" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section faq" id="faq">
          <div className="wrap narrow">
            <h2 className="section-title center">FAQ</h2>

            <div className="faq-list">
              <details className="faq-item" open>
                <summary>
                  Do I need government relations experience to use it?
                </summary>
                <p>
                  No. Most of the organisations we work with have never had
                  someone dedicated to this before. The templates and
                  intelligence tool are built to be used without prior
                  experience, and the advisory calls are there specifically to
                  help you turn what you&apos;re seeing into action.
                </p>
              </details>
              <details className="faq-item">
                <summary>Who are your experts?</summary>
                <p>
                  Our experts are former government staffers who work with FORE
                  to help you turn intelligence into strategy and action. They
                  bring the judgement behind our advisory calls. They know
                  how government actually works, who to talk to, and what to do
                  next.
                </p>
              </details>
              <details className="faq-item">
                <summary>
                  We don&apos;t need government relations help every month, is
                  this still worth it?
                </summary>
                <p>
                  Yes. The moments that matter rarely announce themselves: a
                  minister&apos;s diary fills up months ahead, a funding round
                  closes while you&apos;re still deciding, a consultation opens
                  and shuts in weeks. By the time it&apos;s obvious, the
                  window&apos;s usually gone. The relationships and positioning
                  that get you through those moments take significant time to
                  build, they can&apos;t be assembled the week you need them.
                  FOREsight does that work in the quiet months, so when something
                  opens, you&apos;re already in the room instead of starting from
                  zero.
                </p>
              </details>
              <details className="faq-item">
                <summary>Is FOREsight a lobbying agency?</summary>
                <p>
                  No. We don&apos;t lobby government on your behalf or take
                  positions for you. FOREsight gives you the tools, structure and
                  expert backup to engage government yourself, in your own
                  voice.
                </p>
              </details>
              <details className="faq-item">
                <summary>
                  How do I make the case to my board or leadership team?
                </summary>
                <p>
                  You&apos;re already carrying this risk today, those decisions
                  get made whether or not anyone&apos;s watching for them. Frame
                  it for your board as closing a gap, not opening a new cost:
                  FOREsight costs far less than a single missed grant round or a
                  badly timed policy shift, and it&apos;s priced to your
                  organisation&apos;s size, not a flat rate built for one ten
                  times bigger. Ask us on your intro call and we&apos;ll help
                  you shape it into something your board will actually respond
                  to.
                </p>
              </details>
              <details className="faq-item">
                <summary>
                  Is FOREsight part of FORE Good? Are you a not-for-profit?
                </summary>
                <p>
                  Yes. FOREsight is built and a part of FORE Good, a
                  not-for-profit. That&apos;s not incidental: it means this comes
                  from inside the sector, not from a commercial vendor guessing
                  what for-purpose organisations need. FOREsight is further built
                  on FORE Good&apos;s own track record (80+ MP meetings and
                  counting since mid April 2026) rather than theory. You can find
                  out more about FORE Good directly at{" "}
                  <a
                    href="http://www.foregood.org.au"
                    target="_blank"
                    rel="noopener"
                  >
                    FOREgood.org.au
                  </a>
                  .
                </p>
              </details>
              <details className="faq-item">
                <summary>Can&apos;t AI do this? Why do I need you?</summary>
                <p>
                  AI can summarise a policy update in seconds and draft you a
                  template and if that&apos;s all you need then great. But what
                  about knowing whether it&apos;s actually relevant to your
                  organisation, whether it&apos;s accurate, or what to do with it
                  once you&apos;ve read it? It comes down to trust and judgement.
                  Everything on FOREsight is verified by our team before it
                  reaches you. We&apos;ve used our templates ourselves and
                  we&apos;ll keep refining them over time. Further, the advisory
                  calls give you real judgement from someone who&apos;s done this
                  work. When the relationships you&apos;re managing took years to
                  build, is a generic AI summary really where you want to take
                  the risk?
                </p>
              </details>
            </div>
          </div>
        </section>

        <section className="footer-cta rip rip-flip">
          <div className="wrap narrow">
            <h2>See what FOREsight can do for your organisation</h2>
            <div className="cta-row">
              <a
                className="btn btn-accent"
                href={INTRO_CALL_LINK}
                target="_blank"
                rel="noopener"
              >
                Book a free intro call
              </a>
              <a
                className="btn btn-outline-light"
                href={QUIZ_LINK}
                target="_blank"
                rel="noopener"
              >
                Take our readiness quiz
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer rip">
        <div className="wrap footer-grid">
          <Newsletter />
          <div className="footer-brand">
            <img
              className="footer-logo"
              src="/assets/logo-horizontal.jpg"
              alt="FOREsight by FORE Good"
            />
            <div className="footer-links">
              <a
                href="http://www.foregood.org.au"
                target="_blank"
                rel="noopener"
              >
                www.FOREgood.org.au
              </a>
              <a href="mailto:hello@foregood.org.au">hello@foregood.org.au</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
