package cmd

import (
	"github.com/factly/dega-server/config"
	coreModel "github.com/factly/dega-server/service/core/model"
	factCheckModel "github.com/factly/dega-server/service/fact-check/model"
	podcastModel "github.com/factly/dega-server/service/podcast/model"
	"github.com/spf13/cobra"
)

func init() {
	rootCmd.AddCommand(migrateCmd)
}

var migrateCmd = &cobra.Command{
	Use:   "migrate",
	Short: "Applies DB migrations for dega-server.",
	Run: func(cmd *cobra.Command, args []string) {
		// db setup
		config.SetupDB()

		factCheckModel.Migration()
		coreModel.Migration()
		podcastModel.Migration()

	},
}
