package algolia

import "errors"

func Reindex(objects []map[string]interface{}) error {
	if index == nil {
		return errors.New("index is nil, please connect to the index first")
	}
	_, err := index.ReplaceAllObjects(objects)
	if err != nil {
		return err
	}
	return nil
}
