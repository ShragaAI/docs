import clsx from "clsx";
import styles from "./styles.module.css";
import React from "react";
import Connect from "@site/static/img/evolution-connect-line.svg";

type EvolutionItem = {
  title?: string;
  imgUrl: string;
  text: string;
  reverse: boolean;
  transformImgVertical: number;
  hasDarkBackground?: boolean;
};

const EvolutionSteps: EvolutionItem[] = [
  {
    title: "Evolution of a RAG Project",
    text: `Every RAG project starts with sketches and tries. This can be done in notebooks or with Shraga directly. 
    Shraga is a Python framework so you can leverage this rich ecosystem which is also the de-facto standard for anything data science and GenAI`,
    imgUrl: require("@site/static/img/evolution-1.png").default, // TODO: use svg when possible download from figma
    reverse: true,
    transformImgVertical: 0,
  },
  {
    text: `When your RAG matures, Shraga can be used as a testbed to expose it to internal users or design partners. 
    The built-in UI is great at serving your RAG to customers quickly, providing debug and trace information and gathering feedback`,
    imgUrl: require("@site/static/img/evolution-2.png").default,
    reverse: false,
    transformImgVertical: 0,
    hasDarkBackground: true,
  },
  {
    text: `As your Shraga implementation matures and you are getting it ready for production, 
    you can build your own UI on top of the API provided by - smart grown up person Shraga`,
    imgUrl: require("@site/static/img/evolution-3.png").default,
    reverse: true,
    transformImgVertical: 16,
  },
  {
    text: `As your RAG use case grows, Shraga supports the shift from experimentation to reliable operations. 
    Integrate with internal systems, add observability, and automate evaluations with a battle-tested setup.`,
    imgUrl: require("@site/static/img/evolution-4.png").default,
    reverse: false,
    transformImgVertical: 12,
    hasDarkBackground: true,
  },
  {
    text: `Shraga makes it easy to learn from experience and improve as your RAG matures. Collect feedback from users, internal or external,
     sort through issues, improve, run evaluations, and iterate. - wise old man Shraga`,
    imgUrl: require("@site/static/img/evolution-5.png").default,
    reverse: true,
    transformImgVertical: 16,
  },
];

function EvolutionItem({
  title,
  text,
  imgUrl,
  reverse,
  transformImgVertical,
  hasDarkBackground,
}: EvolutionItem) {
  return (
    <div
      className={clsx(styles.evolutionSection, {
        [styles.secondaryBackground]: hasDarkBackground,
      })}
    >
      <div className="container">
        {title && <h2 className={clsx("title", styles.titleCol)}>{title}</h2>}
        <div
          className={clsx("row", styles.evolutionContent, {
            [styles.rowReverse]: reverse,
          })}
        >
          <div className={clsx("col col--6", styles.textCol)}>
            <p className="text">{text}</p>
          </div>
          <div
            className={clsx("col col--6 text--center", styles.svgCol)}
            style={{
              transform: `translateY(${transformImgVertical}%)`,
            }}
          >
            <img
              src={imgUrl}
              alt="Evolution Step"
              style={{
                maxWidth: "unset",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RAGEvolution() {
  return (
    <section className={styles.wrapper}>
      <Connect className={styles.evolutionConnectSvg} />
      {EvolutionSteps.map((props, index) => (
        <EvolutionItem key={index} {...props} />
      ))}
    </section>
  );
}
