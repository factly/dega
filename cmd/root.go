package cmd

import (
	"github.com/factly/dega-server/config"
	"github.com/spf13/cobra"
)

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "dega-server",
	Short: "A lightweight CMS written in Go.",
	Long:  `A lightweight, scalable & high performant CMS written in Go. Developed for modern web features with all the best practices built-in.`,
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	cobra.CheckErr(rootCmd.Execute())
}

func init() {
	cobra.OnInitialize(config.SetupVars)
}
