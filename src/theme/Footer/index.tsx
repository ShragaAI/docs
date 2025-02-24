import React from "react";
import type FooterType from "@theme/Footer";
import type { WrapperProps } from "@docusaurus/types";
import styles from "./styles.module.css";

type Props = WrapperProps<typeof FooterType>;
export default function FooterWrapper(props: Props): JSX.Element {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <img src="img/logo-footer.svg" alt="Shraga Logo" />
        </div>

        <div className={styles.links}>
          {/* TODO: ajust privacy and policy links  */}
          <a href="/terms">Terms & Conditions</a>
          <a href="/privacy">Privacy Policy</a>
        </div>

        <div className={styles.copyright}>
          © {new Date().getFullYear()} BigData Boutique
        </div>
      </div>
    </footer>
  );
}
