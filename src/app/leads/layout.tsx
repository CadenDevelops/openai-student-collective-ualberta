import type { Metadata } from "next";
import { Atmosphere } from "@/components/atmosphere";
import "./workspace.css";
export const metadata: Metadata = {
  title: "Leads | UAlberta Student Collective",
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="workspace">
      <a className="skip-link" href="#workspace-main">
        Skip to workspace
      </a>
      <Atmosphere />
      <header className="workspace-brand">
        <a href="/" aria-label="Student Collective home">
          <img src="/openai-blossom.svg" alt="" width="32" height="32" />
          <span>
            Student Collective<small>University of Alberta</small>
          </span>
        </a>
      </header>
      <main id="workspace-main">{children}</main>
    </div>
  );
}
