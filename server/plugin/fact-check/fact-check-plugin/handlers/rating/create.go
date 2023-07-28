package rating

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/plugin/fact-check/fact-check-plugin/db"
	"github.com/factly/dega-server/plugin/fact-check/fact-check-plugin/utils"
	"github.com/factly/dega-server/plugin/fact-check/shared"
	"github.com/factly/dega-server/plugin/fact-check/shared/model"
	"github.com/factly/x/slugx"
	"github.com/factly/x/validationx"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

func Create(r shared.Request) (shared.Any, *shared.Error) {
	log.Println("REQUEST: ", r)
	sID := r.Space

	medID, ok := r.Body["medium_id"].(float64)
	var medIDValue *uint = nil
	if ok {
		medIDUint := uint(medID)
		medIDValue = &medIDUint
	}

	rating := model.Rating{
		Name:             r.Body["name"].(string),
		Slug:             r.Body["slug"].(string),
		NumericValue:     r.Body["numeric_value"].(float64),
		Description:      convertJsonb(r.Body["description"]),
		DescriptionHTML:  r.Body["description_html"].(string),
		MetaFields:       convertJsonb(r.Body["meta_fields"]),
		Meta:             convertJsonb(r.Body["meta"]),
		BackgroundColour: convertJsonb(r.Body["background_colour"]),
		TextColour:       convertJsonb(r.Body["text_colour"]),
		MediumID:         medIDValue,
		SpaceID:          uint(sID),
		HeaderCode:       r.Body["header_code"].(string),
		FooterCode:       r.Body["footer_code"].(string),
	}

	validationError := validationx.Check(rating)

	if validationError != nil {
		validationErrorMessages := ""
		for _, msg := range validationError {
			validationErrorMessages = fmt.Sprint(validationErrorMessages, msg.Message, "\n")
		}
		return nil, &shared.Error{Message: "validation error", Code: http.StatusBadRequest, Error: errors.New(validationErrorMessages)}
	}

	log.Println(rating)

	// Get table name
	stmt := &gorm.Statement{DB: db.DB}
	_ = stmt.Parse(&model.Rating{})
	tableName := stmt.Schema.Table

	var ratingSlug string
	if rating.Slug != "" && slugx.Check(rating.Slug) {
		ratingSlug = rating.Slug
	} else {
		ratingSlug = slugx.Make(rating.Name)
	}

	// Check if rating with same name exist
	if utils.CheckName(uint(sID), rating.Name, tableName) {
		return nil, &shared.Error{Message: "rating with same name exists", Code: http.StatusBadRequest}
	}

	// Check if rating with same numeric value exist
	var sameValueRatings int64
	db.DB.Model(&model.Rating{}).Where(&model.Rating{
		SpaceID:      uint(sID),
		NumericValue: rating.NumericValue,
	}).Count(&sameValueRatings)

	if sameValueRatings > 0 {
		return nil, &shared.Error{Message: "rating with same numeric value exist", Code: http.StatusUnprocessableEntity}
	}

	mediumID := rating.MediumID

	result := &model.Rating{
		Base: config.Base{
			CreatedAt: rating.CreatedAt,
			UpdatedAt: rating.UpdatedAt,
		},
		Name:             rating.Name,
		Slug:             slugx.Approve(&db.DB, ratingSlug, sID, tableName),
		BackgroundColour: rating.BackgroundColour,
		Description:      rating.Description,
		DescriptionHTML:  rating.DescriptionHTML,
		TextColour:       rating.TextColour,
		MediumID:         mediumID,
		SpaceID:          uint(sID),
		NumericValue:     rating.NumericValue,
		MetaFields:       rating.MetaFields,
		Meta:             rating.Meta,
		HeaderCode:       rating.HeaderCode,
		FooterCode:       rating.FooterCode,
	}

	tx := db.DB.Begin()
	err := tx.Model(&model.Rating{}).Create(&result).Error

	if err != nil {
		return nil, &shared.Error{Message: "error creating rating", Code: http.StatusInternalServerError, Error: err}
	}

	tx.Model(&model.Rating{}).Preload("Medium").First(&result)

	tx.Commit()

	log.Println("Created Rating", result)

	return result, nil
}

func convertJsonb(m interface{}) postgres.Jsonb {
	v, _ := json.Marshal(m)
	res := postgres.Jsonb{}
	res.RawMessage = v
	return res
}
