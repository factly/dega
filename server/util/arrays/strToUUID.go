package arrays

import "github.com/google/uuid"

func StrToUUID(ids []string) ([]uuid.UUID, error) {
	uuids := make([]uuid.UUID, 0)
	for _, id := range ids {
		uuid, err := uuid.Parse(id)
		if err != nil {
			return nil, err
		}
		uuids = append(uuids, uuid)
	}
	return uuids, nil
}
