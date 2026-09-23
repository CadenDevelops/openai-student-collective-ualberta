import { Atmosphere, OffscreenPause, ScrollReveals } from "@/components/atmosphere";
import { Arrow, SocialIcon } from "@/components/icons";
import { collective, externalUrl } from "@/content/collective";
import { formatWhen, upcomingEvents, type LumaEvent } from "@/lib/luma";

/** How many questions show before the rest fold behind "More questions". */
const faqShown = 6;

/** Renders the one inline [text](https://…) link an answer may carry. Kept
    this small on purpose: the content file stays readable without pulling a
    Markdown parser in for seventeen sentences. */
function Answer({ text }: { text: string }) {
  // [\s\S] rather than the dotAll flag, which this tsconfig target rules out.
  const m = /^([\s\S]*?)\[([^\]]+)\]\((https:\/\/[^)]+)\)([\s\S]*)$/.exec(text);
  if (!m) return <p>{text}</p>;
  return <p>{m[1]}<a href={m[3]}>{m[2]}</a>{m[4]}</p>;
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return <li>
    <details>
      <summary><span>{q}</span><span className="faq-mark" aria-hidden="true" /></summary>
      <Answer text={a} />
    </details>
  </li>;
}

function Brand({ footer = false }: { footer?: boolean }) {
  return <a className={`brand${footer ? " brand-footer" : ""}`} href="#top" aria-label="OpenAI Student Collective, back to top">
    <img className="brand-logo" src="/collective-mark.png" width="40" height="40" alt="" />
    <span className="brand-copy"><span>{collective.name}</span><span>{collective.university}</span></span>
  </a>;
}

function EventCard({ event }: { event: LumaEvent }) {
  const when = formatWhen(event);
  const where = event.online ? "Online" : event.venue ?? "UAlberta · location on the event page";
  const status = event.status === "waitlist" ? "Join the waitlist" : event.status === "full" ? "Full" : "Register";
  return <li className="event-item" data-reveal>
    <a href={event.url}>
      <time className="event-date" dateTime={when.iso}><span>{when.month}</span><span>{when.dayNum}</span></time>
      <span className="event-info">
        <span className="event-title">{event.title}</span>
        <span className="event-meta">{when.day} · {when.hours}</span>
        <span className="event-meta">{where}</span>
      </span>
      {event.cover && <img className="event-cover" src={event.cover} alt="" width="120" height="120" loading="lazy" />}
      <span className={`event-cta${event.status !== "open" ? " event-cta-muted" : ""}`}>{status} <Arrow /></span>
    </a>
  </li>;
}

export default async function Home() {
  const discord = externalUrl(collective.links.discord);
  const luma = externalUrl(collective.links.luma);
  const interest = collective.interestForm;
  // null means Luma could not be read; [] means it was read and nothing is scheduled.
  const events = await upcomingEvents(collective.lumaCalendarId);
  const next = events?.[0];
  // Only destinations that actually exist become cards; a missing link is left out entirely.
  const socials = ([
    { key: "interest" as const, label: "Stay in the loop", description: "Hear first when workshops are scheduled.", href: interest },
    { key: "discord" as const, label: "Discord", description: "Join the conversation.", href: discord },
    { key: "luma" as const, label: "Luma", description: next ? `Next up ${formatWhen(next).day}: ${next.title}` : "Browse upcoming events.", href: luma },
  ]).flatMap((social) => social.href ? [{ ...social, href: social.href }] : []);

  return <>
    <a className="skip-link" href="#main">Skip to main content</a>
    <div id="top" className="first-screen">
      <header className="site-header">
        <div className="shell header-inner">
          <Brand />
          <nav className="site-nav" aria-label="Sections">
            <a href="#events">Events</a><a href="#team">Team</a><a href="#faq">FAQ</a>
          </nav>
          <a className="header-cta" href={interest}>Stay in the loop</a>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <section className="hero" aria-labelledby="hero-title">
          <Atmosphere />
          <div className="hero-content">
            <p className="hero-badge">Free ChatGPT Plus at workshops</p>
            <h1 id="hero-title">Explore AI<span>with us.</span></h1>
            <p className="hero-description">OpenAI’s student program. Right here at UAlberta.</p>
            <nav className="link-stack" aria-label="Find the collective">
              <p className="stack-label">Get involved</p>
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
            <div className="upcoming" data-reveal>
              <h3 className="upcoming-label">Upcoming</h3>
              {events && events.length > 0
                ? <ul className="event-list">{events.map((event) => <EventCard key={event.id} event={event} />)}</ul>
                : <div className="upcoming-empty">
                    <div>
                      <p className="upcoming-empty-title">{events ? "The first sessions are being planned now." : "See what’s coming up on our calendar."}</p>
                      <p>{events ? "Tell us when you’re free and what you’d like to learn, and we’ll let you know as soon as dates are set." : "Our event list couldn’t load just now. Everything is on Luma."}</p>
                    </div>
                    <div className="upcoming-actions">
                      {events && <a className="button button-primary" href={interest}>Tell us when you’re free <Arrow /></a>}
                      {luma && <a className="button button-secondary" href={luma}>{events ? "Follow on Luma" : "Open the calendar"} <Arrow /></a>}
                    </div>
                  </div>}
              {events && events.length > 0 && luma && <a className="upcoming-all" href={luma}>Full calendar on Luma <Arrow /></a>}
            </div>
            <h3 className="formats-label" data-reveal>What we run</h3>
            <ul className="event-gallery" aria-label="Event formats">
              {collective.events.formats.map((format) => <li key={format.title} data-reveal>
                <div className="event-photo">
                  <img src={format.image} alt={format.alt} width="1200" height="800" loading="lazy" />
                </div>
                <div className="event-caption"><h3>{format.title}</h3><p>{format.description}</p></div>
              </li>)}
            </ul>
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
              {collective.faq.slice(0, faqShown).map((item) => <FaqItem key={item.q} q={item.q} a={item.a} />)}
            </ul>
            {collective.faq.length > faqShown && <details className="faq-more">
              <summary>More questions <span>({collective.faq.length - faqShown})</span></summary>
              <ul className="faq-list">
                {collective.faq.slice(faqShown).map((item) => <FaqItem key={item.q} q={item.q} a={item.a} />)}
              </ul>
            </details>}
          </section>
          </div>
        </div>
      </main>
    </div>
    <footer className="site-footer shell">
      <div className="footer-brand">
        <Brand footer />
        <p>Part of OpenAI’s Student Collective, run by the UAlberta Campus Leads.</p>
      </div>
      <nav className="footer-links" aria-label="Footer">
        <a href={interest}>Stay in the loop <Arrow /></a>
        {discord && <a href={discord}>Discord <Arrow /></a>}
        {luma && <a href={luma}>Events on Luma <Arrow /></a>}
        <a href="https://openai.com/student-collective/">The program at OpenAI <Arrow /></a>
      </nav>
    </footer>
    <ScrollReveals />
    <OffscreenPause />
  </>;
}
