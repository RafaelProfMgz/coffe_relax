import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "@/lib/source";
import { SITE, SITE_PAGES } from "@/lib/site";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      nav={{
        title: (
          <span className="docs-brand">
            <span aria-hidden>☕</span> {SITE.name}
          </span>
        ),
        url: "/",
      }}
      links={[
        { text: "Abrir o café", url: "/" },
        ...SITE_PAGES.filter((p) => ["/faq", "/sistema", "/contato"].includes(p.href)).map((p) => ({
          text: p.label,
          url: p.href,
        })),
      ]}
      githubUrl={SITE.repo}
      themeSwitch={{ enabled: false }}
    >
      {children}
    </DocsLayout>
  );
}
