package searchService

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
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
	BatchUpdate(data []map[string]interface{}) error
	SearchQuery(q, filters, kind string, limit, offset int) ([]interface{}, error)
	DeleteAllDocuments() error
	BatchDelete(objectIDs []string) error
	GetAllDocumentsBySpace(space uint) ([]interface{}, error)
}

var timeout time.Duration = time.Second * 10

func SetTimeout(time time.Duration) {
	timeout = time
}

type SearchConfig struct {
	Name      string              `json:"name,omitempty"`
	Host      string              `json:"host,omitempty"`
	APIkeys   map[string]string   `json:"api_keys"`
	IndexName string              `json:"index_name"`
	Settings  map[string][]string `json:"settings"`
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
		return &Meilisearch{
			config: &SearchConfig{
				Name: "Meilisearch",
			},
		}
	} else {
		return &CustomSearch{
			config: &SearchConfig{
				Name: "Custom",
			},
		}
	}
}

func GetSearchServiceConfig() (*SearchConfig, error) {
	config := new(SearchConfig)
	jsonFile, err := os.Open("./data/search-config.json")
	if err != nil {
		return nil, err
	}
	defer jsonFile.Close()
	fileBuffer, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(fileBuffer, config)
	if err != nil {
		return nil, err
	}

	return config, nil
}

func (m *Meilisearch) Connect(config *SearchConfig) error {
	meilisearchClient.Client = meilisearch.NewClient(meilisearch.ClientConfig{
		Host:    config.Host,
		APIKey:  config.APIkeys["meili_api_key"],
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

func (m *Meilisearch) BatchUpdate(data []map[string]interface{}) error {
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

func (m *Meilisearch) SearchQuery(q, filters, kind string, limit, offset int) ([]interface{}, error) {
	filter := [][]string{}
	filter = append(filter, []string{filters})
	if kind != "" {
		filter = append(filter, []string{fmt.Sprintf("kind=%s", kind)})
	}

	result, err := meilisearchClient.Client.Index(meilisearchClient.config.IndexName).Search(q, &meilisearch.SearchRequest{
		Filter: filter,
		Limit:  int64(limit),
		Offset: int64(offset),
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
	reqBody := map[string]interface{}{
		"name":       config.Name,
		"host":       config.Host,
		"index_name": config.IndexName,
		"settings":   config.Settings,
	}

	customSearchClient.Client = &http.Client{
		Timeout: timeout,
	}

	customSearchClient.config = config
	byteStream := new(bytes.Buffer)
	err := json.NewEncoder(byteStream).Encode(reqBody)
	if err != nil {
		return err
	}

	req, err := http.NewRequest(http.MethodPost, fmt.Sprintf("%s/%s", config.Host, "connect"), byteStream)
	if err != nil {
		return err
	}

	for keyName, apiKey := range config.APIkeys {
		req.Header.Add(keyName, apiKey)
	}

	response, err := customSearchClient.Client.Do(req)
	if err != nil {
		return err
	}

	defer response.Body.Close()
	if response.StatusCode != 202 {
		return errors.New("error in connecting to the search index")
	}

	return nil
}

func (c *CustomSearch) Add(data map[string]interface{}) error {
	if data["kind"] == nil || data["kind"] == "" {
		return errors.New("no kind field in meili document")
	}
	if data["id"] == nil || data["id"] == "" {
		return errors.New("no id field in meili document")
	}

	data["object_id"] = fmt.Sprint(data["kind"], "_", data["id"])

	byteStream := new(bytes.Buffer)
	err := json.NewEncoder(byteStream).Encode(&data)
	if err != nil {
		return err
	}
	if customSearchClient.Client == nil {
		return errors.New("http client in custom search not connected")
	}
	req, err := http.NewRequest(http.MethodPost, fmt.Sprintf("%s/%s", customSearchClient.config.Host, "add"), byteStream)
	if err != nil {
		return err
	}

	response, err := customSearchClient.Client.Do(req)
	if err != nil {
		return err
	}

	defer response.Body.Close()

	if response.StatusCode != http.StatusCreated {
		return errors.New("unable to add object to the search index")
	}

	return nil
}

func (c *CustomSearch) BatchAdd(objects []map[string]interface{}) error {
	for _, data := range objects {
		if data["kind"] == nil || data["kind"] == "" {
			return errors.New("no kind field in search document")
		}
		if data["id"] == nil || data["id"] == "" {
			return errors.New("no id field in search document")
		}

		data["object_id"] = fmt.Sprint(data["kind"], "_", data["id"])
	}

	byteStream := new(bytes.Buffer)
	err := json.NewEncoder(byteStream).Encode(&objects)
	if err != nil {
		return err
	}
	if customSearchClient.Client == nil {
		return errors.New("http client in custom search not connected")
	}

	req, err := http.NewRequest(http.MethodPost, fmt.Sprintf("%s/%s/%s", customSearchClient.config.Host, "batch", "add"), byteStream)
	if err != nil {
		return err
	}

	response, err := customSearchClient.Client.Do(req)
	if err != nil {
		return err
	}

	defer response.Body.Close()

	if response.StatusCode != http.StatusCreated {
		return errors.New("unable to add objects to the search index")
	}

	return nil
}

func (c *CustomSearch) Delete(kind string, id uint) error {
	if customSearchClient.Client == nil {
		return errors.New("http client in custom search not connected")
	}

	objectID := fmt.Sprintf("%s_%d", kind, id)
	reqURL := customSearchClient.config.Host + "/delete?object_id=" + objectID
	req, err := http.NewRequest(http.MethodDelete, reqURL, nil)
	if err != nil {
		return err
	}

	response, err := customSearchClient.Client.Do(req)
	if err != nil {
		return err
	}

	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return errors.New("unable to delete object in the search index")
	}

	return nil
}

func (c *CustomSearch) Update(data map[string]interface{}) error {
	if data["kind"] == nil || data["kind"] == "" {
		return errors.New("no kind field in meili document")
	}
	if data["id"] == nil || data["id"] == "" {
		return errors.New("no id field in meili document")
	}

	data["object_id"] = fmt.Sprint(data["kind"], "_", data["id"])

	byteStream := new(bytes.Buffer)
	err := json.NewEncoder(byteStream).Encode(&data)
	if err != nil {
		return err
	}
	if customSearchClient.Client == nil {
		return errors.New("http client in custom search not connected")
	}
	req, err := http.NewRequest(http.MethodPut, fmt.Sprintf("%s/%s", customSearchClient.config.Host, "update"), byteStream)
	if err != nil {
		return err
	}

	response, err := customSearchClient.Client.Do(req)
	if err != nil {
		return err
	}

	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return errors.New("unable to update the object in the search index")
	}

	return nil
}

func (c *CustomSearch) SearchQuery(q, filters, kind string, limit, offset int) ([]interface{}, error) {
	reqBody := map[string]interface{}{
		"query":  q,
		"offset": offset,
	}

	if limit != -1 {
		reqBody["limit"] = limit
	}

	if filters != "" {
		reqBody["filters"] = filters + "AND kind=" + kind
	} else {
		reqBody["filters"] = "kind=" + kind
	}

	byteStream := new(bytes.Buffer)
	err := json.NewEncoder(byteStream).Encode(&reqBody)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest(http.MethodPost, fmt.Sprintf("%s/%s", customSearchClient.config.Host, "search"), byteStream)
	if err != nil {
		return nil, err
	}

	response, err := customSearchClient.Client.Do(req)
	if err != nil {
		return nil, err
	}

	defer response.Body.Close()

	if response.StatusCode != 200 {
		return nil, errors.New("unable to execute the search query")
	}

	var results []interface{}
	err = json.NewDecoder(response.Body).Decode(&results)
	if err != nil {
		return nil, err
	}

	return results, nil
}

func (c *CustomSearch) DeleteAllDocuments() error {
	reqURL := customSearchClient.config.Host + "/delete/all"
	req, err := http.NewRequest(http.MethodDelete, reqURL, nil)
	if err != nil {
		return err
	}

	response, err := customSearchClient.Client.Do(req)
	if err != nil {
		return err
	}

	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return errors.New("unable to delete objects in the search index")
	}

	return nil
}

func (c *CustomSearch) BatchDelete(objectIDs []string) error {
	objectIDString := ""
	for i := 0; i < len(objectIDs)-1; i++ {
		objectIDString += objectIDs[i] + ","
	}
	objectIDString += objectIDs[len(objectIDs)-1]
	reqURL := customSearchClient.config.Host + "/batch/delete?object_ids=" + objectIDString
	req, err := http.NewRequest(http.MethodDelete, reqURL, nil)
	if err != nil {
		return err
	}

	response, err := customSearchClient.Client.Do(req)
	if err != nil {
		return err
	}

	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return errors.New("unable to delete objects in the search index")
	}

	return nil
}

func (c *CustomSearch) GetAllDocumentsBySpace(space uint) ([]interface{}, error) {
	reqBody := map[string]interface{}{
		"query":   "",
		"filters": "space_id=" + fmt.Sprintf("%d", space),
	}

	byteStream := new(bytes.Buffer)
	err := json.NewEncoder(byteStream).Encode(&reqBody)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest(http.MethodPost, fmt.Sprintf("%s/%s", customSearchClient.config.Host, "search"), byteStream)
	if err != nil {
		return nil, err
	}

	response, err := customSearchClient.Client.Do(req)
	if err != nil {
		return nil, err
	}

	defer response.Body.Close()

	if response.StatusCode != 200 {
		return nil, errors.New("unable to execute the search query")
	}

	var results []interface{}
	err = json.NewDecoder(response.Body).Decode(&results)
	if err != nil {
		return nil, err
	}
	return results, nil
}

func (c *CustomSearch) BatchUpdate(objects []map[string]interface{}) error {
	if customSearchClient.Client == nil {
		return errors.New("http client in custom search not connected")
	}

	for _, data := range objects {
		if data["kind"] == nil || data["kind"] == "" {
			return errors.New("no kind field in search document")
		}
		if data["id"] == nil || data["id"] == "" {
			return errors.New("no id field in search document")
		}

		data["object_id"] = fmt.Sprint(data["kind"], "_", data["id"])
	}

	byteStream := new(bytes.Buffer)
	err := json.NewEncoder(byteStream).Encode(&objects)
	if err != nil {
		return err
	}

	req, err := http.NewRequest(http.MethodPut, fmt.Sprintf("%s/%s/%s", customSearchClient.config.Host, "batch", "update"), byteStream)
	if err != nil {
		return err
	}

	response, err := customSearchClient.Client.Do(req)
	if err != nil {
		return err
	}

	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return errors.New("unable to add objects to the search index")
	}

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
