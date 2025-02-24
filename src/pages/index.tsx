import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";

import HeroSection from "@site/src/components/HomepageHero";
import RAGEvolution from "@site/src/components/HomeRagEvolution";
import HomepageFooter from "@site/src/components/HomepageFooter";

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <HeroSection />
      <main>
        <RAGEvolution />
        <HomepageFooter />
      </main>
    </Layout>
  );
}
