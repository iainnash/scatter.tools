import { ConnectButton } from "@rainbow-me/rainbowkit";
import Head from "next/head";
import styles from "../styles/Home.module.css";

export const Page = ({ children }: { children: any }) => (
  <>
    <Head>
      <title>scatter.tools</title>
      <meta name="description" content="Private NFT Collection Tools" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <div className={styles.container}>
      <section className={styles.wallet}>
        <ConnectButton />
      </section>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <a href="" target="_blank" rel="noopener noreferrer">
          iain.in
        </a>
      </footer>
    </div>
  </>
);
