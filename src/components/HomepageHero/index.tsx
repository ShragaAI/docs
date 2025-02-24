import React from "react";
import clsx from "clsx";
import { useColorMode } from "@docusaurus/theme-common";
import DarkLogo from "@site/static/img/logo-full-dark.svg";
import LightLogo from "@site/static/img/logo-full-light.svg";
import HeroImage from "@site/static/img/hero.svg";
import styles from "./styles.module.css";

export default function HeroSection() {
  const { colorMode } = useColorMode();

  return (
    <section className={clsx(styles.heroSection)}>
      <div className="container">
        <div className={clsx("row px-8", styles.responsiveRow)} >
          <div className="col col--6">
            {colorMode === "dark" ? (
              <LightLogo className={styles.logo} role="img" />
            ) : (
              <DarkLogo className={styles.logo} role="img" />
            )}

            <p className="text">
              Lorem ipsum dolor sit amet consectetur. Nunc est egestas mi sed in
              malesuada a accumsan aliquam.
            </p>
            <p className="text">
              Ut vitae faucibus bibendum tellus ullamcorper aliquam purus.
              Tincidunt tincidunt morbi duis quis facilisi eget nunc habitasse.
            </p>
            <p className="text">
              Venenatis sit fringilla condimentum a a eu mi. Fusce morbi id
              viverra neque urna.
            </p>
          </div>

          <div className="col col--6 text--center">
            <HeroImage className={styles.heroImage} role="img" />
          </div>
        </div>
      </div>
    </section>
  );
}
