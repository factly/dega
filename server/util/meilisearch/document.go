package meilisearch

import (
	"errors"
	"fmt"
	"strings"

	"github.com/factly/dega-server/config"
	"github.com/google/uuid"
	"github.com/meilisearch/meilisearch-go"
)

// AddDocument addes object into meili search index
func AddDocument(indexName string, data map[string]interface{}) error {
	if data["kind"] == nil || data["kind"] == "" {
		return errors.New("no kind field in meili document")
	}
	if data["id"] == nil || data["id"] == "" {
		return errors.New("no id field in meili document")
	}

	data["object_id"] = fmt.Sprint(data["kind"], "_", data["id"])

	arr := []map[string]interface{}{data}

	_, err := config.MeilisearchClient.Index(indexName).UpdateDocuments(arr)
	if err != nil {
		return err
	}

	return nil
}

// DeleteDocument updates the document in meili index
func DeleteDocument(indexName string, id string, kind string) error {
	objectID := fmt.Sprint(kind, "_", id)
	_, err := config.MeilisearchClient.Index(indexName).Delete(objectID)
	if err != nil {
		return err
	}

	return nil
}

// UpdateDocument updates the document in meili index
func UpdateDocument(indexName string, data map[string]interface{}) error {
	if data["kind"] == nil || data["kind"] == "" {
		return errors.New("no kind field in meili document")
	}
	if data["id"] == nil || data["id"] == "" {
		return errors.New("no id field in meili document")
	}

	data["object_id"] = fmt.Sprint(data["kind"], "_", data["id"])

	arr := []map[string]interface{}{data}

	_, err := config.MeilisearchClient.Index(indexName).UpdateDocuments(arr)
	if err != nil {
		return err
	}

	return nil
}

// SearchWithQuery calls meili with q
func SearchWithQuery(indexName, q, filters, kind string) ([]interface{}, error) {
	filter := [][]string{}
	filter = append(filter, []string{filters})
	if kind != "" {
		filter = append(filter, []string{fmt.Sprintf("kind=%s", kind)})
	}
	result, err := config.MeilisearchClient.Index(indexName).Search(q, &meilisearch.SearchRequest{
		Filter: filter,
		Limit:  1000000,
	})

	if err != nil {
		return nil, err
	}
	return result.Hits, nil
}

// GetIDArray gets array of IDs for search results
func GetIDArray(hits []interface{}) []uuid.UUID {
	arr := make([]uuid.UUID, 0)

	if len(hits) == 0 {
		return arr
	}

	for _, hit := range hits {
		hitMap := hit.(map[string]interface{})
		id, _ := uuid.Parse(hitMap["id"].(string))

		arr = append(arr, id)
	}

	return arr
}

// GenerateFieldFilter generates filter in form "(field=x OR field=y OR ...)"
func GenerateFieldFilter(ids []string, field string) string {
	filter := "("
	for i, id := range ids {
		id = strings.TrimSpace(id)
		if id != "" {
			if i == len(ids)-1 {
				filter = fmt.Sprint(filter, field, "=", id, ")")
				break
			}
			filter = fmt.Sprint(filter, field, "=", id, " OR ")
		}
	}
	return filter
}
