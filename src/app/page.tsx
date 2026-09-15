import { Atmosphere, ScrollReveals } from "@/components/atmosphere";
import { Arrow, SocialIcon } from "@/components/icons";
import { collective, externalUrl } from "@/content/collective";

function Brand({ footer = false }: { footer?: boolean }) {
  return <a className={`brand${footer ? " brand-footer" : ""}`} href="#top" aria-label="OpenAI Student Collective, back to top">
    <img className="brand-logo" src="/openai-blossom.svg" width="40" height="40" alt="" />
    <span className="brand-copy"><span>{collective.name}</span><span>{collective.university}</span></span>
  </a>;
}

export default function Home() {
  const discord = externalUrl(collective.links.discord);
  const events = externalUrl(collective.links.luma);
  const socials = [
    { key: "discord" as const, label: "Discord", description: "Join the conversation." },
    { key: "luma" as const, label: "Luma events", description: "Find your next meetup." },
    { key: "instagram" as const, label: "Instagram", description: "See what we’re up to." },
  ];

  return <>
    <a className="skip-link" href="#main">Skip to main content</a>
    <div id="top" className="first-screen">
      <Atmosphere />
      <header className="site-header shell">
        <Brand />
        <nav aria-label="Main navigation"><a className="header-link" href={discord ?? "#connect"}>Join Discord <Arrow /></a></nav>
      </header>
      <main id="main" tabIndex={-1}>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-content">
            <h1 id="hero-title">Explore AI<span>with us.</span></h1>
            <p className="hero-description">OpenAI’s student program. Right here at UAlberta.</p>
            <div className="hero-actions">
              <a className="button button-primary" href={discord ?? "#connect"}>Join Discord <Arrow /></a>
              <a className="button button-secondary" href={events ?? "#connect"}>View events <Arrow /></a>
            </div>
          </div>
          <a className="scroll-cue" href="#about"><Arrow down /><span>Get to know us</span></a>
        </section>
        <div className="details">
          <section id="about" className="about content-shell" aria-labelledby="about-title">
            <div data-reveal>
              <p className="eyebrow">An OpenAI program</p>
              <h2 id="about-title">So, what’s the Collective?</h2>
              <p className="section-description">The Student Collective is OpenAI’s campus program for learning and building with ChatGPT and Codex. At UAlberta, that means workshops, drop-in studio hours, and a place to work on your own ideas. All the tools you need to start creating will be provided for free.</p>
              <p className="welcome-note">Come try something new, get help with a project, or meet people outside your usual classes. No coding experience needed.</p>
              <a className="program-link" href="https://openai.com/student-collective/">About the program at OpenAI <Arrow /></a>
            </div>
          </section>
          <section id="connect" className="connect content-shell" aria-label="Connect with the collective">
            <div className="social-links" data-reveal>
              {socials.map((social) => {
                const href = externalUrl(collective.links[social.key]);
                const content = <><span className="social-top"><SocialIcon kind={social.key}/><span>{social.label}</span>{href && <Arrow />}</span><span className="social-description">{href ? social.description : "Link coming soon"}</span></>;
                return href ? <a className="social-link" key={social.key} href={href}>{content}</a> : <div className="social-link social-unavailable" key={social.key}>{content}</div>;
              })}
            </div>
          </section>
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
                  <div><h3><a href={member.linkedin}>{member.name} <Arrow /></a></h3><p>{member.role}</p><p className="member-program">{member.program}</p></div>
                </li>)}</ul>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
    <footer className="site-footer shell"><Brand footer /><p>Part of the OpenAI Student Collective.</p></footer>
    <ScrollReveals />
  </>;
}
