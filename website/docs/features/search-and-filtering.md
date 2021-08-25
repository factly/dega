---
sidebar_position: 6
---

# Search and Filtering

Dega has a powerful search and filtering built using [MeiliSearch](https://www.meilisearch.com/).
The search will return results from the titles and the content of your posts and pages. It will also return results from other fields such as to excerpt, description, claim, fact, etc. Results can be filtered using the attributes of an entity. The fields used as filters are user-defined.

## MeiliSearch

The core concepts of MeiliSearch are:

- [Documents](https://docs.meilisearch.com/learn/core_concepts/documents.html#primary-field): It is an object composed of one or more fields. Each field consists of an attribute and its associated value.
- [Indexes](https://docs.meilisearch.com/learn/core_concepts/indexes.html#index-creation): It is an entity that gathers a set of documents with its settings.
- [Relevancy](https://docs.meilisearch.com/learn/core_concepts/relevancy.html#ranking-rules): It refers to the accuracy and effectiveness of search results. The most appropriate search results are considered as Relevant results.

All the documents are gathered and associated with an index. Each index has its relevancy rules. For example, Dega will be index and all the objects will be considered as documents. The relevancy rules describe the order in which the query will be matched with the attributes of the documents. For example, if the document attributes are listed as follows: id, title, description. There are two posts related to fitness, first has the title as 'Healthy diet' and the second has the title as 'Physical Fitness'; then on searching for 'fitness' second post will be at the top of the list

### Ranking Rules

To ensure relevant results, search responses are sorted according to a set of consecutive rules called ranking rules.

Whenever a search query is made, MeiliSearch uses a bucket sort to rank documents. The first ranking rule is applied to all documents, while each subsequent rule is only applied to documents that are considered equal under the previous rule (i.e. as a tiebreaker).

MeiliSearch contains five built-in ranking rules: words, typo, proximity, attribute, and exactness, in that default order.

- Words: Results are sorted by decreasing the number of matched query terms. Returns documents that contain all query terms first.
- Typo: Results are sorted by an increasing number of typos. Returns documents that match query terms with fewer typos first.
- Proximity: Results are sorted by an increasing distance between matched query terms. Returns documents where query terms occur close together and in the same order as the query string first.
- Attribute: Results are sorted according to the attribute ranking order. Returns documents that contain query terms in more important attributes first.
- Exactness: Results are sorted by the similarity of the matched words with the query words. Returns documents that contain the same terms as the ones queried first.

### Attribute Ranking Order

In a typical dataset, some fields are more relevant to search than others. A title, for example, has a value more meaningful to a post search than its description or its published_date.

By default, the attribute ranking order is generated automatically based on the attributes' order of appearance in the indexed documents. However, the SearchableAttributes list can also be manually set. This list describes which fields are searchable and also dictates the attribute ranking order.

## Filtering

MeiliSearch allows you to define [filters](https://docs.meilisearch.com/reference/features/filtering_and_faceted_search.html?#configuring-filters) so you can filter through the results based on user-defined criteria. Filters use document fields to establish filtering criteria. To use a document field as a filter, you must first add its attribute to the FilterableAttributes index setting.

For example, to filter posts based on their category, author, status, etc you must add these fields to the FilterableAttributes list.
