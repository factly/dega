---
sidebar_position: 2
---

# Projects

Factly Labs works on developing and managing various applications that will increase access to public data and information by making it easy, interactive and intuitive. [Counting India](https://countingindia.com) is Factly’s first tool in its beta version that focuses on accessibility and data visualization of Census-2011 data. Factly is currently working on various applications that are in different stages of development.

## Maturity Levels

We use the following phases to define the projects maturity:

- **Sandbox:** Applications that are in an experimental phases. Completed PoC, but haven't deployed a usable product yet. Expect breaking changes and not suitable for Production usage.
- **Incubating:** Deployed in Production at Factly or one major organisation for less than a year. Developed & maintained actively. High likelihood of breaking changes for backward compatability. Please reach out to the Factly Team on the [slack channel](https://slack.factly.org) before using the applications in a Production setting.
- **Graduated:** Deployed in Production at Factly or multiple other organisations for over a year. Developed & maintained actively. Suitable for usage in Production.
- **Retired:** Not actively developed and supported. Users will be provided enough notice before a service is ever retired.

## Dega

Dega is a lightweight, scalable & high performant open-source publishing platform for media organisations of all sizes. The platform has various features built-in for fact-checking organisations. Dega supports managing multiple organisations and sites from the same portal. It is developed for modern web features with all the publishing best practices built-in. The tool is written in Go & React.

**GitHub Repositories:**
- https://github.com/factly/dega
- https://github.com/factly/dega-themes

**License:** [MIT](https://github.com/factly/dega/blob/master/LICENSE) <br/>
**Maturity:** Incubating

## VidCheck

VidCheck is a web application that makes video fact-checking more standardized for fact-checkers, easy to read and understand for audiences, and scalable for platforms & fact-checkers. The application can be used in cases where claims being fact-checked are part of the video such as political speeches, news content, documentaries, any other type of commentary, manipulated content etc. VidCheck is written in Go & React.

**GitHub Repository:** https://github.com/factly/vidcheck <br/>
**License:** [MIT](https://github.com/factly/vidcheck/blob/develop/LICENSE) <br/>
**Maturity:** Incubating

## Kavach

Kavach is an open-source identity and access management solution. It is a lightweight solution with features to manage organisations, users, permissions and can be configured easily to support applications required multitenancy. Kavach is written in Go, React and is built on ORY stack of services.

**GitHub Repository:** https://github.com/factly/kavach <br/>
**License:** [MIT](https://github.com/factly/kavach/blob/develop/LICENSE) <br/>
**Maturity:** Incubating

## MandE

MandE is an open-source application to develop data portals to publish datasets in various formats. It provides features to publish private datasets and has e-commerce features specific to datasets. Datasets will be available for access as APIs and can be integrated with visualization platforms. MandE is written in Go for the backend and React for the frontend.

**GitHub Repository:** https://github.com/factly/mande <br/>
**License:** [MIT](https://github.com/factly/mande/blob/develop/LICENSE) <br/>
**Maturity:** Incubating

## Bindu

Bindu is a modern open-source Data visualization platform built on Vega, Vega-Lite. It provides the ability for analysts to create charts and dashboards from a rich set of chart templates. The access policies can be set at the chart level, providing ability to share it with a set of users or publish it for the general public. The backend for Bindu is written in Go and the frontend in React.

**GitHub Repository:** https://github.com/factly/bindu <br/>
**License:** [AGPL3](https://github.com/factly/bindu/blob/develop/LICENSE) <br/>
**Maturity:** Sandbox

## Parlens

Parlens is a tool for searching data that is indexed from Indian parliament datasets. <br/>
**Maturity:** Sandbox

## Counting India

Counting India (CI) is the first major application developed as an initiative of Factly Labs. CI makes data related to the States/Districts in India more accessible and understandable. The primary source of data for CI is the Census of India 2011 and other official sources. In CI, one can compare any two States/Districts side by side. One can also embed, access or download the data.

We envision that every person who is interested in using data in their sphere of work will value CI’s platform. CI will also be a reliable resource for policy makers, journalists and researchers to explore and discover stories of public interest in India.

CI code is licensed under the MIT License. CI has been modeled on tools like Wazimap Kenya, Census Reporter and as inspired by NepalMap.

**GitHub Repository:** https://github.com/factly/janaganana <br/>
**License:** [MIT](https://github.com/factly/janaganana/blob/master/LICENSE) <br/>
**Maturity:** Graduated