package meili

import (
	"errors"
	"fmt"
)

// UpdateDocument updates the document in meili index
func UpdateDocument(data map[string]interface{}) error {
	if data["kind"] == nil || data["kind"] == "" {
		return errors.New("no kind field in meili document")
	}
	if data["id"] == nil || data["id"] == "" {
		return errors.New("no id field in meili document")
	}

	data["object_id"] = fmt.Sprint(data["kind"], "_", data["id"])

	arr := []map[string]interface{}{data}

	_, err := Client.Documents("dega").AddOrUpdate(arr)
	if err != nil {
		return err
	}

	return nil
}
