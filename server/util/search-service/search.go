package searchService

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/factly/x/loggerx"
	"github.com/meilisearch/meilisearch-go"
	"github.com/spf13/viper"
)

type SearchService interface {
	Connect(config *SearchConfig) error
	Add(data map[string]interface{}) error
	BatchAdd(data []map[string]interface{}) error
	Delete(kind string, id uint) error
	Update(data map[string]interface{}) error
	UpdateDocuments(data []map[string]interface{}) error
	SearchQuery(q, filters, kind string) ([]interface{}, error)
	DeleteAllDocuments() error
	BatchDelete(objectIDs []string) error
	GetAllDocumentsBySpace(space uint) ([]interface{}, error)
}

var timeout time.Duration = time.Second * 10

func SetTimeout(time time.Duration) {
	timeout = time
}

type SearchConfig struct {
	Name      string
	Host      string
	APIkey    string
	IndexName string
	Settings  map[string][]string
}

type Meilisearch struct {
	config *SearchConfig
	Client *meilisearch.Client
}

type CustomSearch struct {
	config *SearchConfig
	Client *http.Client
}

var meilisearchClient Meilisearch
var customSearchClient CustomSearch

func GetSearchService() SearchService {
	if viper.GetBool("use_meilisearch") {
		return &Meilisearch{}
	} else {
		return &CustomSearch{}
	}
}

func (m *Meilisearch) Connect(config *SearchConfig) error {
	meilisearchClient.Client = meilisearch.NewClient(meilisearch.ClientConfig{
		Host:    config.Host,
		APIKey:  config.APIkey,
		Timeout: timeout,
	})

	meilisearchClient.config = config
	_, err := meilisearchClient.Client.GetIndex(meilisearchClient.config.IndexName)
	if err != nil {
		_, err = meilisearchClient.Client.CreateIndex(&meilisearch.IndexConfig{
			Uid:        meilisearchClient.config.IndexName,
			PrimaryKey: "object_id",
		})

		if err != nil {
			loggerx.Error(err)
			return err
		}
	}

	filterableAttributes, ok := meilisearchClient.config.Settings["filterable_attributes"]
	if ok {
		_, err = meilisearchClient.Client.Index(meilisearchClient.config.IndexName).UpdateFilterableAttributes(&filterableAttributes)
		if err != nil {
			loggerx.Error(err)
			return err
		}
	}

	searchableAttributes, ok := meilisearchClient.config.Settings["searchable_attributes"]
	if ok {
		_, err = meilisearchClient.Client.Index(meilisearchClient.config.IndexName).UpdateSearchableAttributes(&searchableAttributes)
		if err != nil {
			loggerx.Error(err)
			return err
		}
	}
	return nil
}

func (m *Meilisearch) Add(data map[string]interface{}) error {
	if data["kind"] == nil || data["kind"] == "" {
		return errors.New("no kind field in meili document")
	}
	if data["id"] == nil || data["id"] == "" {
		return errors.New("no id field in meili document")
	}

	data["object_id"] = fmt.Sprint(data["kind"], "_", data["id"])

	arrayOfDocuments := []map[string]interface{}{data}
	_, err := meilisearchClient.Client.Index(meilisearchClient.config.IndexName).UpdateDocuments(arrayOfDocuments)
	if err != nil {
		return err
	}
	return nil
}

func (m *Meilisearch) BatchAdd(data []map[string]interface{}) error {
	for index, docs := range data {
		if docs["kind"] == nil || docs["kind"] == "" {
			return errors.New("no kind field in meili document")
		}
		if docs["id"] == nil || docs["id"] == "" {
			return errors.New("no id field in meili document")
		}
		data[index]["object_id"] = fmt.Sprint(docs["kind"], "_", docs["id"])
	}

	_, err := meilisearchClient.Client.Index(meilisearchClient.config.IndexName).UpdateDocuments(data)
	if err != nil {
		return err
	}
	return err
}

func (m *Meilisearch) Delete(kind string, id uint) error {
	objectID := fmt.Sprintf("%s_%d", kind, id)
	_, err := meilisearchClient.Client.Index(meilisearchClient.config.IndexName).Delete(objectID)
	if err != nil {
		return err
	}
	return err
}

func (m *Meilisearch) Update(data map[string]interface{}) error {
	if data["kind"] == nil || data["kind"] == "" {
		return errors.New("no kind field in meili document")
	}
	if data["id"] == nil || data["id"] == "" {
		return errors.New("no id field in meili document")
	}

	data["object_id"] = fmt.Sprint(data["kind"], "_", data["id"])

	arrayOfDocuments := []map[string]interface{}{data}
	_, err := meilisearchClient.Client.Index(meilisearchClient.config.IndexName).UpdateDocuments(arrayOfDocuments)
	if err != nil {
		return err
	}
	return nil
}

func (m *Meilisearch) UpdateDocuments(data []map[string]interface{}) error {
	for index, docs := range data {
		if docs["kind"] == nil || docs["kind"] == "" {
			return errors.New("no kind field in meili document")
		}
		if docs["id"] == nil || docs["id"] == "" {
			return errors.New("no id field in meili document")
		}
		data[index]["object_id"] = fmt.Sprint(docs["kind"], "_", docs["id"])
	}

	_, err := meilisearchClient.Client.Index(meilisearchClient.config.IndexName).UpdateDocuments(data)
	if err != nil {
		return err
	}
	return err
}

func (m *Meilisearch) SearchQuery(q, filters, kind string) ([]interface{}, error) {
	filter := [][]string{}
	filter = append(filter, []string{filters})
	if kind != "" {
		filter = append(filter, []string{fmt.Sprintf("kind=%s", kind)})
	}

	result, err := meilisearchClient.Client.Index(meilisearchClient.config.IndexName).Search(q, &meilisearch.SearchRequest{
		Filter: filter,
		Limit:  100000,
	})

	if err != nil {
		return nil, err
	}
	return result.Hits, nil
}

func (m *Meilisearch) DeleteAllDocuments() error {
	_, err := meilisearchClient.Client.Index(meilisearchClient.config.IndexName).DeleteAllDocuments()
	if err != nil {
		return err
	}
	return nil
}

func (m *Meilisearch) BatchDelete(objectIDs []string) error {
	_, err := meilisearchClient.Client.Index(meilisearchClient.config.IndexName).DeleteDocuments(objectIDs)
	if err != nil {
		return err
	}
	return nil
}

func (m *Meilisearch) GetAllDocumentsBySpace(space uint) ([]interface{}, error) {
	res, err := meilisearchClient.Client.Index(meilisearchClient.config.IndexName).Search("", &meilisearch.SearchRequest{
		Filter: "space_id=" + fmt.Sprint(space),
	})
	if err != nil {
		return nil, err
	}

	return res.Hits, nil
}

func (c *CustomSearch) Connect(config *SearchConfig) error {
	customSearchClient.config = config
	var reqBody bytes.Buffer
	err := json.NewEncoder(&reqBody).Encode(customSearchClient.config)
	if err != nil {
		return err
	}

	customSearchClient.Client = &http.Client{Timeout: timeout}
	_, err = http.NewRequest(http.MethodGet, fmt.Sprintln(config.Host, "/connect"), &reqBody)
	if err != nil {
		return err
	}

	return nil
}

func (c *CustomSearch) Add(data map[string]interface{}) error {
	return nil
}

func (c *CustomSearch) BatchAdd(data []map[string]interface{}) error {
	return nil
}

func (c *CustomSearch) Delete(kind string, id uint) error {
	return nil
}

func (c *CustomSearch) Update(data map[string]interface{}) error {
	return nil
}

func (c *CustomSearch) SearchQuery(q, filters, kind string) ([]interface{}, error) {
	return nil, nil
}

func (c *CustomSearch) DeleteAllDocuments() error {
	return nil
}

func (c *CustomSearch) BatchDelete(objectIDs []string) error {
	return nil
}

func (c *CustomSearch) GetAllDocumentsBySpace(space uint) ([]interface{}, error) {
	return nil, nil
}

func (c *CustomSearch) UpdateDocuments(data []map[string]interface{}) error {
	return nil
}

// GetIDArray gets array of IDs for search results
func GetIDArray(hits []interface{}) []uint {
	arr := make([]uint, 0)

	if len(hits) == 0 {
		return arr
	}

	for _, hit := range hits {
		hitMap := hit.(map[string]interface{})
		id := hitMap["id"].(float64)
		arr = append(arr, uint(id))
	}

	return arr
}

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
