import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import HomepageFeatures from '../components/HomepageFeatures';
import Introduction from '../components/Introduction';
import useBaseUrl from '@docusaurus/useBaseUrl';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.tagline}</h1>
        <p className="hero__subtitle">{siteConfig.customFields.hero}</p>
        <div className={styles.buttons}>
          <p className={styles.button}>
          <Link
            className="button button--success button--lg"
            to="/docs/introduction/managed-hosting">
            Request Access
          </Link>
          </p>
          <p className={styles.button}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/introduction/what-is-dega">
            Documentation
          </Link>       
          </p>   
        </div>  
        <img 
          // className={styles.introSvg}
          src={useBaseUrl('/img/home/hero-image.png')} 
        />
      </div> 
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.tagline}`}
      description="Written in Go & React. All publishing best practices built-in. For individual bloggers and scales to large organizations.">
      <HomepageHeader />
      <main>
        <Introduction />       
        {/* <HomepageFeatures /> */}
      </main>
    </Layout>
  );
}
