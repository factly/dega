package algolia

import (
	"errors"

	"github.com/algolia/algoliasearch-client-go/v3/algolia/opt"
)

func Update(object map[string]interface{}) error {
	if _, ok := object["objectID"]; !ok {
		return errors.New("please provide objectID in request body")
	}

	if index == nil {
		return errors.New("index is nil, please connect to the index first")
	}
	_, err := index.PartialUpdateObject(object, opt.CreateIfNotExists(true))
	if err != nil {
		return err
	}
	return nil
}

func BatchUpdate(objects []map[string]interface{}) error {
	for _, object := range objects {
		if _, ok := object["objectID"]; !ok {
			return errors.New("please provide objectID in request body")
		}
	}

	if index == nil {
		return errors.New("index is nil, please connect to the index first")
	}

	_, err := index.PartialUpdateObjects(objects, opt.CreateIfNotExists(true))
	if err != nil {
		return err
	}
	return nil
}
