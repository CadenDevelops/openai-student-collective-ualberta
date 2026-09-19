import { Atmosphere, ScrollReveals } from "@/components/atmosphere";
import { Arrow, SocialIcon } from "@/components/icons";
import { collective, externalUrl } from "@/content/collective";

/** Renders the one inline [text](https://…) link an answer may carry. Kept
    this small on purpose: the content file stays readable without pulling a
    Markdown parser in for seventeen sentences. */
function Answer({ text }: { text: string }) {
  // [\s\S] rather than the dotAll flag, which this tsconfig target rules out.
  const m = /^([\s\S]*?)\[([^\]]+)\]\((https:\/\/[^)]+)\)([\s\S]*)$/.exec(text);
  if (!m) return <p>{text}</p>;
  return <p>{m[1]}<a href={m[3]}>{m[2]}</a>{m[4]}</p>;
}

function Brand({ footer = false }: { footer?: boolean }) {
  return <a className={`brand${footer ? " brand-footer" : ""}`} href="#top" aria-label="OpenAI Student Collective, back to top">
    <img className="brand-logo" src="/collective-mark.png" width="40" height="40" alt="" />
    <span className="brand-copy"><span>{collective.name}</span><span>{collective.university}</span></span>
  </a>;
}

export default function Home() {
  const discord = externalUrl(collective.links.discord);
  // Only destinations that actually exist become cards; a missing link is left out entirely.
  const socials = ([
    { key: "discord" as const, label: "Discord", description: "Join the conversation." },
    { key: "luma" as const, label: "Luma", description: "Browse upcoming events." },
  ]).flatMap((social) => {
    const href = externalUrl(collective.links[social.key]);
    return href ? [{ ...social, href }] : [];
  });

  return <>
    <a className="skip-link" href="#main">Skip to main content</a>
    <div id="top" className="first-screen">
      <header className="site-header shell">
        <Brand />
      </header>
      <main id="main" tabIndex={-1}>
        <section className="hero" aria-labelledby="hero-title">
          <Atmosphere />
          <div className="hero-content">
            <p className="hero-badge">Free ChatGPT Plus at workshops</p>
            <h1 id="hero-title">Explore AI<span>with us.</span></h1>
            <p className="hero-description">OpenAI’s student program. Right here at UAlberta.</p>
            <nav className="link-stack" aria-label="Find the collective">
              <p className="stack-label">Find us</p>
              <div className="link-rows">
                {socials.map((social) => <a className={`link-row link-${social.key}`} key={social.key} href={social.href}>
                  <span className="link-icon"><SocialIcon kind={social.key} /></span>
                  <span className="link-copy"><span className="link-label">{social.label}</span><span className="link-note">{social.description}</span></span>
                  <span className="link-go"><Arrow /></span>
                </a>)}
              </div>
            </nav>
          </div>
          <a className="scroll-cue" href="#about"><Arrow down /><span>Get to know us</span></a>
        </section>
        <div className="details">
          <div className="section-band about-band">
            <div className="section-light" aria-hidden="true"><span/><span/></div>
          <section id="about" className="about content-shell" aria-labelledby="about-title">
            <div data-reveal>
              <div className="about-grid">
                <div className="about-heading">
                  <p className="eyebrow">An OpenAI program</p>
                  <h2 id="about-title">So, what’s the Collective?</h2>
                </div>
                <div className="about-copy">
                  <p className="section-description">The Student Collective is OpenAI’s campus program for learning and building with ChatGPT and Codex. At UAlberta, that means workshops, drop-in studio sessions, and a place to work on your own ideas. All the tools you need to start creating will be provided for free.</p>
                  <p className="welcome-note">Come try something new, get help with a project, or meet people outside your usual classes. No coding experience needed.</p>
                  <div className="perk">
                    <p className="perk-tag">Included</p>
                    <p>Come to a workshop and you’ll get a free month of ChatGPT Plus on your personal account.</p>
                  </div>
                  <a className="program-link" href="https://openai.com/student-collective/">About the program at OpenAI <Arrow /></a>
                </div>
              </div>
              <div className="about-figure" aria-hidden="true">
                <div className="figure-glow" />
                <div className="figure-rings"><span /><span /><span /></div>
              </div>
            </div>
          </section>
          </div>
          <div className="section-band events-band">
            <div className="section-light" aria-hidden="true"><span/><span/></div>
          <section id="events" className="events content-shell" aria-labelledby="events-title">
            <div className="events-heading" data-reveal>
              <div><p className="eyebrow">On campus</p><h2 id="events-title">Events at UAlberta</h2></div>
              <p>On campus, with people from every program.<br/>No experience needed.</p>
            </div>
            <ul className="event-gallery" aria-label="Event formats">
              {collective.events.formats.map((format) => <li key={format.title} data-reveal>
                <div className="event-photo">
                  <img src={format.image} alt={format.alt} width="1200" height="800" loading="lazy" />
                </div>
                <div className="event-caption"><h3>{format.title}</h3><p>{format.description}</p></div>
              </li>)}
            </ul>
            <p className="events-note">{collective.events.note}</p>
            <div className="events-footer">
              <p>Photos from the wider <a href="https://openai.com/student-collective/">OpenAI Student Collective</a>.</p>
              <a className="events-updates" href={discord ?? "#top"}>Get event updates <Arrow /></a>
            </div>
          </section>
          </div>
          <div className="section-band team-band">
            <div className="section-light" aria-hidden="true"><span/><span/></div>
          <section id="team" className="team content-shell" aria-labelledby="team-title">
            <div data-reveal>
              <p className="eyebrow">Your Campus Leads</p>
              <h2 id="team-title">We’re Caden and Michael.</h2>
              <p className="team-intro">We’re your OpenAI Campus Leads at UAlberta. Find us at a workshop, or come say hi on Discord.</p>
              <div className="team-layout">
                <figure className="campus-photo">
                  <img src="/campus-leads.jpg" alt="Caden and Michael standing together in front of the green and gold A on the University of Alberta campus." width="1280" height="1706" loading="lazy" />
                  <figcaption>Caden and Michael in main quad</figcaption>
                </figure>
                <ul className="team-list">{collective.team.map((member) => <li key={member.name}>
                  <img className="member-photo" src={member.photo} alt={member.name} width="88" height="88" loading="lazy" />
                  <div>
                    <h3>{member.name}</h3><p>{member.role}</p><p className="member-program">{member.program}</p>
                    <div className="member-links">
                      <a href={member.linkedin} aria-label={`${member.name} on LinkedIn`}><SocialIcon kind="linkedin" />LinkedIn</a>
                      <a href={member.instagram} aria-label={`${member.name} on Instagram`}><SocialIcon kind="instagram" />Instagram</a>
                    </div>
                  </div>
                </li>)}</ul>
              </div>
            </div>
          </section>
          </div>
          <div className="section-band faq-band">
            <div className="section-light" aria-hidden="true"><span/><span/></div>
          <section id="faq" className="faq content-shell" aria-labelledby="faq-title">
            <div data-reveal>
              <p className="eyebrow">Before you come</p>
              <h2 id="faq-title">Frequently asked questions</h2>
            </div>
            <ul className="faq-list">
              {collective.faq.map((item) => <li key={item.q}>
                <details>
                  <summary><span>{item.q}</span><span className="faq-mark" aria-hidden="true" /></summary>
                  <Answer text={item.a} />
                </details>
              </li>)}
            </ul>
          </section>
          </div>
        </div>
      </main>
    </div>
    <footer className="site-footer shell">
      <Brand footer />
      {discord ? <a className="footer-link" href={discord}>Join the Discord <Arrow /></a> : <p>Part of the OpenAI Student Collective.</p>}
    </footer>
    <ScrollReveals />
  </>;
}
