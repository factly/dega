package editorjs

import (
	"errors"
	"fmt"
)

// BlockMap returns block map for loading into template
func BlockMap(raw map[string]interface{}) ([]map[string]interface{}, error) {
	blocks, ok := raw["blocks"].([]interface{})
	if !ok {
		return nil, errors.New("type error for blocks")
	}

	blockMap := make([]map[string]interface{}, 0)

	for i, blk := range blocks {
		block := blk.(map[string]interface{})

		btype, ok := block["type"].(string)
		if !ok {
			return nil, errors.New(fmt.Sprint("type error for type in block #", i))
		}
		bdata, ok := block["data"].(map[string]interface{})
		if !ok {
			return nil, errors.New(fmt.Sprint("type error for data in block #", i))
		}

		bdataMap := make(map[string]interface{})
		for k, v := range bdata {
			bdataMap[k] = v
		}

		blockMap = append(blockMap, map[string]interface{}{"type": btype, "data": bdataMap})
	}
	return blockMap, nil
}
