package cli

import (
	"os"

	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "occlux",
	Short: "CLI for sharing encrypted secrets",
}

func Execute() {
	godotenv.Load()

	if url := os.Getenv("OCCLUX_SERVER_URL"); url != "" {
		rootCmd.PersistentFlags().Lookup("server").DefValue = url
		rootCmd.PersistentFlags().Set("server", url)
	}

	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

func init() {
	rootCmd.PersistentFlags().StringP("server", "s", "", "server address")
}
