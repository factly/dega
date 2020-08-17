package tag

import (
	"os"
	"strconv"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/setup"
	"github.com/factly/dega-server/util/test"
	"github.com/joho/godotenv"
	"gopkg.in/h2non/gock.v1"
)

type TagsRet struct {
	Created  string `json:"created_at"`
	Deleted  string `json:"deleted_at"`
	Desc     string `json:"description"`
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Slug     string `json:"slug"`
	Space_ID int    `json:"space_id"`
	Updated  string `json:"updated_at"`
}

func TestMain(m *testing.M) {

	godotenv.Load("../../../../.env")

	userId, orgId := test.GetUserOrg()
	org := strconv.Itoa(orgId)
	user := strconv.Itoa(userId)

	config.SetupDB()

	// Mock Keto and kavach servers and allowing persisted external traffic
	defer gock.Disable()
	test.MockServer()
	gock.New(os.Getenv("DSN")).EnableNetworking().Persist()
	defer gock.DisableNetworking()

	os.Setenv("ORG_ID", org)
	os.Setenv("USER_ID", user)

	setup.CreateDB()
	exitValue := m.Run()
	setup.DeleteTestDB()

	os.Exit(exitValue)

}

func SetUp() (*model.Space, *model.Tag) {
	org, _ := strconv.Atoi(os.Getenv("ORG_ID"))

	// Create new space
	CreateSpace := &model.Space{
		Name:           "test space",
		Slug:           "test-space",
		OrganisationID: org,
	}
	config.DB.Create(&CreateSpace)

	// Create a new Tag
	CreateTag := &model.Tag{
		SpaceID: CreateSpace.ID,
		Name:    "test tag",
		Slug:    "test-tag",
	}

	return CreateSpace, CreateTag
}

func TearDown() {
	config.DB.Unscoped().Delete(&model.Tag{})
	config.DB.Unscoped().Delete(&model.Space{})
}
