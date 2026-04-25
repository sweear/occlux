package cli

import (
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/spf13/cobra"
)

var createLong = `Create a new encrypted secret and return a shareable link.

The secret is encrypted locally before being sent to the server.
Only the person with the link can decrypt and view it.

Examples:
  occlux create "my secret"
  occlux create "my secret" --ttl 1440 --views 3
  echo "my secret" | occlux create`

var createCmd = &cobra.Command{
	Use:   "create [secret]",
	Short: "Create a new secret",
	Long:  createLong,
	Args:  cobra.MaximumNArgs(1),
	RunE:  runCreate,
}

func init() {
	rootCmd.AddCommand(createCmd)

	createCmd.Flags().IntP("ttl", "t", 1440, "secret lifetime in minutes (1-4320)")
	createCmd.Flags().IntP("views", "v", 1, "number of allowed views (1-100)")
}

func runCreate(cmd *cobra.Command, args []string) error {
	var text string
	if len(args) == 1 {
		text = args[0]
	} else {
		data, err := io.ReadAll(os.Stdin)
		if err != nil {
			return fmt.Errorf("failed to read from stdin: %w", err)
		}
		text = strings.TrimSpace(string(data))
	}

	if text == "" {
		return fmt.Errorf("secret text cannot be empty")
	}

	ttl, err := cmd.Flags().GetInt("ttl")
	if err != nil {
		return fmt.Errorf("invalid ttl: %w", err)
	}

	views, err := cmd.Flags().GetInt("views")
	if err != nil {
		return fmt.Errorf("invalid views: %w", err)
	}

	if ttl < 1 || ttl > 4320 {
		return fmt.Errorf("ttl must be between 1 and 4320 minutes")
	}

	if views < 1 || views > 100 {
		return fmt.Errorf("views must be between 1 and 100")
	}

	encryptedData, keyStr, err := Encrypt(text)
	if err != nil {
		return fmt.Errorf("encryption failed: %w", err)
	}

	serverURL, _ := cmd.Root().PersistentFlags().GetString("server")

	result, err := apiCreate(serverURL, encryptedData, views, ttl)
	if err != nil {
		return err
	}

	fmt.Printf("%s/s/%s#%s\n", serverURL, result.ID, keyStr)

	return nil
}