package cmd

import (
	"log"

	"github.com/factly/dega-server/config"
	"github.com/spf13/cobra"
)

func init() {
	rootCmd.AddCommand(superOrgCmd)
}

var superOrgCmd = &cobra.Command{
	Use:   "create-super-org",
	Short: "Creates super organisation for dega-server.",
	Run: func(cmd *cobra.Command, args []string) {
		// db setup
		config.SetupDB()

		err := config.CreateSuperOrganisation()
		if err != nil {
			log.Println(err)
		}
	},
}
