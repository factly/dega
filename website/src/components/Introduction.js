import React from 'react';
import clsx from 'clsx';
import styles from './Introduction.module.css';

const IntroList = [
  {
    title: 'What is Dega?',
    description: (
      <>
        Dega is a lightweight, scalable & high performant open-source publishing platform with all the publishing best practices built into the platform. 
        It has a very permissive MIT License and can be used to develop anything from a simple blog to complex websites to handle millions of users. 
        Dega comes with various built-in features like SEO optimisation, structured data, social login, flexible organisation & user management, modern editing capabilities, powerful access rules, performant APIs, integrated analytics, hyper-relevant search & filtering, image proxy, caching, events, and many more. 
        Dega is one of the projects developed by Factly Labs, the technology & research team at Factly, an IFCN verified signatory.
      </>
    ),
  },  {
    title: 'How does Dega help with fact-checking?',
    description: (
      <>
        Dega incorporates all the best practices of the ‘fact-checking’ ecosystem as mandated by the International Fact Checking Network (IFCN) Code of principles into the platform. 
        It enables organisations to seamlessly publish fact-check stories like any other. 
        With all technology platforms moving towards using ClaimReview & MediaReview schemas as a means to identify fact-check content, Dega helps newsrooms implement this seamlessly without any major changes to the existing technical architecture. 
        Dega has various tools within the platform that would aid fact-checkers with their research. With Dega, SEO and all the other publishing best practices are built-in. 
        Dega's fact-check service is a product of feedback from Factly and other fact-checking organisations with extensive experience in fact-checking.
      </>
    ),
  },
  {
    title: 'Who can use Dega?',
    description: (
      <>
        Dega can be used to develop anything from a simple blog to a complex website handling millions of users. 
        Hence, it can be used by individual publishers and it scales to organisations of any size. 
        Dega supports all the core features in WordPress and lets you create a modern, industry standard website without the need for adding any third-party plugins, external applications, or any technical knowledge.
      </>
    ),
  },
  {
    title: 'How does Dega benefit individual publishers?',
    description: (
      <>
        Individual publishers can <a href="docs/introduction/managed-hosting">sign up</a> on Dega and publish fact check stories under their name like publishing stories on Medium. 
        There are various tools built-in to the platform to reduce the entry barrier for new fact-checkers to publish quality fact checks & stories like large organisations. 
        There will be some form of editorial oversight (approval process) before a fact-check gets published. 
        This is intended for individuals who wish to fact-check from across the world and in various languages. 
        This we hope would serve the hyper-local fact check needs.
      </>
    ),
  },
  {
    title: 'How does Dega benefit organisations?',
    description: (
      <>
        Dega can be used to deploy and manage websites for all sizes of organisations. 
        Dega can be used to develop websites that can handle millions of users per day. 
        Dega comes with various features such as user & organisation management, powerful access rules, performant APIs, integrated analytics, hyper-relevant search & filtering, image proxy, caching, events, and many other features that help to develop and maintain websites with large traffic. 
        Content is published in various industry-standard formats as in APIs, RSS feeds, Accelerated Mobile Pages (AMP), Instant Articles, PWA, etc without any additional work from the publishers. 
        organisations can manage multiple websites from a single instance of Dega and in fact, Dega provides the capabilities for hosting multiple organisations from the same instance. 
        Dega is developed as micro-service architecture and all the features are exposed as performant APIs for organisations that would like to build their own UI or integrate Dega with their existing interface.
      </>
    ),
  },  
  {
    title: 'How does it benefit the Audience?',
    description: (
      <>
        Dega makes it very simple for publishing modern websites with a great user experience and industry-standard best practices. 
        This in turn helps the audience to consume content in more intuitive ways regardless of the technical capabilities of the publisher. 
        Publishers are enforced to maintain certain standards while producing content, which helps with generating quality content for the audience overall. 
        Dega also makes it easy for the audience to subscribe and share publishers’ content that they like.
      </>
    ),
  },
  {
    title: 'How does it benefit Platforms? ',
    description: (
      <>
        Social Media & Search platforms can use ClaimReview, MediaReview, and other relevant schemas for structured data generated automatically based on the content published. 
        All the content published on Dega is also accessible in various industry-standard formats for such platforms as in APIs, RSS feeds, Accelerated Mobile Pages (AMP), Instant Articles, etc. 
        Publishers are enforced to maintain certain best practices when producing content, which in turn helps with generating a large ecosystem of standaridised, quality content. 
        Hosting platforms can host instances of Dega for other publishing organisations. 
        Each instance of Dega can support multiple organisations and multiple websites within each organisation.
      </>
    ),
  },
];

function Intro({title, description}) {
  return (
    <div className={styles.introContainer}>
      <div className="padding-horiz--md">
        <h1>{title}</h1>
        <p className={styles.introDescription}>{description}</p>
      </div>
    </div>
  );
}

export default function Introduction() {
  return (
    <section className={styles.intros}>
      <div className="container">
        <div className="row">
          {IntroList.map((props, idx) => (
            <Intro key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
