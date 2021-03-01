package claim

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/permissions/spacePermission"
	"github.com/factly/dega-server/test/service/fact-check/claimant"
	"github.com/factly/dega-server/test/service/fact-check/rating"
	"github.com/factly/dega-server/util"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestClaimDetails(t *testing.T) {
	mock := test.SetupMockDB()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	s := test.RunDefaultNATSServer()
	defer s.Shutdown()
	util.ConnectNats()

	t.Run("invalid claim id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)
		e.GET(path).
			WithPath("claim_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("claim record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)
		recordNotFoundMock(mock)

		e.GET(path).
			WithPath("claim_id", "100").
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
	})

	t.Run("get claim by id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)
		SelectWithSpace(mock)
		claimant.SelectWithOutSpace(mock, claimant.Data)
		rating.SelectWithOutSpace(mock, rating.Data)

		e.GET(path).
			WithPath("claim_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(Data)
	})

}
