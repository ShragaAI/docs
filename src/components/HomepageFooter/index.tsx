import clsx from "clsx";
import styles from "./styles.module.css";

import GitHubIcon from "@site/static/img/github-icon.svg";
import DocsIcon from "@site/static/img/docs-icon.svg";
import Button from "../Base/Button";

export default function HomepageFooter() {
  return (
    <section className={clsx(styles.footerSection, "container")}>
      <h2 className="title" style={{maxWidth: '600px'}}>Try it Now, or Some Better Heading Here</h2>

      <div className={styles.footerButtons}>
        <Button
          to="https://github.com/ShragaAI"
          variant="filled"
          Icon={GitHubIcon}
        >
          GitHub
        </Button>
        <Button to="/docs/intro" variant="outlined" Icon={DocsIcon}>
          Docs
        </Button>
      </div>
    </section>
  );
}
