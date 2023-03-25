package main

import (
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/factly/dega-server/plugin/search/shared"
	"github.com/hashicorp/go-plugin"
	"github.com/meilisearch/meilisearch-go"
)

type MeiliSearchPlugin struct {
	config shared.SearchConfig
	client *meilisearch.Client
}

func (m *MeiliSearchPlugin) Connect(config *shared.SearchConfig) error {
	log.Println("MeiliSearchPlugin.Connect() called")
	var timeout = 10 * time.Second
	if config.Timeout != 0 {
		timeout = config.Timeout
	}
	m.config = *config
	meilisearchClient := meilisearch.NewClient(meilisearch.ClientConfig{
		Host:    config.Host,
		APIKey:  config.APIkeys["meili_api_key"],
		Timeout: timeout * time.Second,
	})
	m.client = meilisearchClient

	_, err := meilisearchClient.GetIndex(config.IndexName)
	if err != nil {
		_, err = meilisearchClient.CreateIndex(&meilisearch.IndexConfig{
			Uid:        config.IndexName,
			PrimaryKey: "object_id",
		})

		if err != nil {
			log.Println(err)
			return err
		}
	}

	filterableAttributes, ok := config.Settings["filterable_attributes"]
	if ok {
		_, err = meilisearchClient.Index(config.IndexName).UpdateFilterableAttributes(&filterableAttributes)
		if err != nil {
			log.Println(err)
			return err
		}
	}

	searchableAttributes, ok := config.Settings["searchable_attributes"]
	if ok {
		_, err = meilisearchClient.Index(config.IndexName).UpdateSearchableAttributes(&searchableAttributes)
		if err != nil {
			log.Println(err)
			return err
		}
	}
	return nil
}

func (m *MeiliSearchPlugin) Add(data map[string]interface{}) error {
	log.Println("MeiliSearchPlugin.Add() called")
	if data["kind"] == nil || data["kind"] == "" {
		return errors.New("no kind field in meili document")
	}
	if data["id"] == nil || data["id"] == "" {
		return errors.New("no id field in meili document")
	}

	data["object_id"] = fmt.Sprint(data["kind"], "_", data["id"])

	arrayOfDocuments := []map[string]interface{}{data}
	_, err := m.client.Index(m.config.IndexName).UpdateDocuments(arrayOfDocuments)
	if err != nil {
		return err
	}
	return nil
}

func (m *MeiliSearchPlugin) BatchAdd(data []map[string]interface{}) error {
	log.Println("MeiliSearchPlugin.BatchAdd() called")
	for index, docs := range data {
		if docs["kind"] == nil || docs["kind"] == "" {
			return errors.New("no kind field in meili document")
		}
		if docs["id"] == nil || docs["id"] == "" {
			return errors.New("no id field in meili document")
		}
		data[index]["object_id"] = fmt.Sprint(docs["kind"], "_", docs["id"])
	}

	_, err := m.client.Index(m.config.IndexName).UpdateDocuments(data)
	if err != nil {
		return err
	}
	return err
}

func (m *MeiliSearchPlugin) Delete(kind string, id uint) error {
	log.Println("MeiliSearchPlugin.Delete() called")
	objectID := fmt.Sprintf("%s_%d", kind, id)
	_, err := m.client.Index(m.config.IndexName).DeleteDocument(objectID)
	if err != nil {
		return err
	}
	return nil
}

func (m *MeiliSearchPlugin) Update(data map[string]interface{}) error {
	log.Println("MeiliSearchPlugin.Update() called")
	if data["kind"] == nil || data["kind"] == "" {
		return errors.New("no kind field in meili document")
	}
	if data["id"] == nil || data["id"] == "" {
		return errors.New("no id field in meili document")
	}

	data["object_id"] = fmt.Sprint(data["kind"], "_", data["id"])

	arrayOfDocuments := []map[string]interface{}{data}
	_, err := m.client.Index(m.config.IndexName).UpdateDocuments(arrayOfDocuments)
	if err != nil {
		return err
	}
	return nil
}

func (m *MeiliSearchPlugin) BatchUpdate(data []map[string]interface{}) error {
	log.Println("MeiliSearchPlugin.BatchUpdate() called")
	for index, docs := range data {
		if docs["kind"] == nil || docs["kind"] == "" {
			return errors.New("no kind field in meili document")
		}
		if docs["id"] == nil || docs["id"] == "" {
			return errors.New("no id field in meili document")
		}
		data[index]["object_id"] = fmt.Sprint(docs["kind"], "_", docs["id"])
	}

	_, err := m.client.Index(m.config.IndexName).UpdateDocuments(data)
	if err != nil {
		return err
	}
	return err
}

func (m *MeiliSearchPlugin) SearchQuery(q, filters, kind string, limit, offset int) (shared.SearchResponse, error) {
	filter := [][]string{}
	filter = append(filter, []string{filters})
	if kind != "" {
		filter = append(filter, []string{fmt.Sprintf("kind=%s", kind)})
	}

	res, err := m.client.Index(m.config.IndexName).Search(q, &meilisearch.SearchRequest{
		Filter: filter,
		Limit:  int64(limit),
		Offset: int64(offset),
	})

	if err != nil {
		return shared.SearchResponse{}, err
	}
	var hitMapArray []map[string]interface{}
	for _, hit := range res.Hits {
		if hitMap, ok := hit.(map[string]interface{}); ok {
			hitMapArray = append(hitMapArray, hitMap)
		}
	}

	result := shared.SearchResponse{
		Hits:             hitMapArray,
		Limit:            res.Limit,
		Offset:           res.Offset,
		TotalHits:        res.EstimatedTotalHits,
		ProcessingTimeMs: res.ProcessingTimeMs,
	}

	return result, nil
}

func (m *MeiliSearchPlugin) DeleteAllDocuments() error {
	log.Println("MeiliSearchPlugin.DeleteAllDocuments() called")
	_, err := m.client.Index(m.config.IndexName).DeleteAllDocuments()
	if err != nil {
		return err
	}
	return nil
}

func (m *MeiliSearchPlugin) BatchDelete(objectIDs []string) error {
	log.Println("MeiliSearchPlugin.BatchDelete() called")
	_, err := m.client.Index(m.config.IndexName).DeleteDocuments(objectIDs)
	if err != nil {
		return err
	}
	return nil
}

func (m *MeiliSearchPlugin) GetAllDocumentsBySpace(space uint) (shared.SearchResponse, error) {
	log.Println("MeiliSearchPlugin.GetAllDocumentsBySpace() called")
	res, err := m.client.Index(m.config.IndexName).Search("", &meilisearch.SearchRequest{
		Filter: "space_id=" + fmt.Sprint(space),
	})
	if err != nil {
		return shared.SearchResponse{}, err
	}
	var hitMapArray []map[string]interface{}
	for _, hit := range res.Hits {
		if hitMap, ok := hit.(map[string]interface{}); ok {
			hitMapArray = append(hitMapArray, hitMap)
		}
	}

	result := shared.SearchResponse{
		Hits:             hitMapArray,
		Limit:            res.Limit,
		Offset:           res.Offset,
		TotalHits:        res.EstimatedTotalHits,
		ProcessingTimeMs: res.ProcessingTimeMs,
	}

	return result, nil
}

func main() {
	plugin.Serve(&plugin.ServeConfig{
		HandshakeConfig: shared.Handshake,
		Plugins: map[string]plugin.Plugin{
			"meilisearch": &shared.SearchPlugin{Impl: &MeiliSearchPlugin{}},
		},
	})
}
