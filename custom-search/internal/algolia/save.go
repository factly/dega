package algolia

import (
	"errors"

	"github.com/factly/x/loggerx"
)

func Save(object map[string]interface{}) error {
	if index == nil {
		return errors.New("index is nil, please connect to the index first")
	}

	_, err := index.SaveObject(object)
	if err != nil {
		loggerx.Error(err)
		return err
	}
	return nil
}

func BatchSave(object []map[string]interface{}) error {
	if index == nil {
		return errors.New("index is nil, please connect to the index first")
	}
		
	_, err := index.SaveObjects(object)
	if err != nil {
		return err
	}
	return nil
}
