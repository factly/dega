package algolia

import (
	"errors"

	"github.com/factly/x/loggerx"
)

func Delete(objectID string) error {
	if index == nil {
		return errors.New("index is nil, please connect to the index first")
	}

	_, err := index.DeleteObject(objectID)
	if err != nil {
		loggerx.Error(err)
		return err
	}
	return nil
}

func BatchDelete(objectIDs []string) error {
	if index == nil {
		return errors.New("index is nil, please connect to the index first")
	}

	_, err := index.DeleteObjects(objectIDs)
	if err != nil {
		loggerx.Error(err)
		return err
	}
	return nil
}

func DeleteAll() error {
	if index == nil {
		return errors.New("index is nil, please connect to the index first")
	}

	_, err := index.ClearObjects()
	if err != nil {
		return err
	}

	return nil
}
