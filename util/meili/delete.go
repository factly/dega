package meili

import (
	"fmt"
)

// DeleteDocument updates the document in meili index
func DeleteDocument(id uint, kind string) error {
	objectID := fmt.Sprint(kind, "_", id)
	_, err := Client.Documents("dega").Delete(objectID)
	if err != nil {
		return err
	}

	return nil
}
