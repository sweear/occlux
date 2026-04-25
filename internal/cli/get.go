package cli

import (
	"fmt"
	"net/url"
	"strings"

	"github.com/spf13/cobra"
)

var getLong = `Retrieve and decrypt a secret using the full link.

The encryption key is extracted from the link fragment (#).
The secret is decrypted locally after retrieval.

Examples:
  occlux get "https://occlux.io/s/abc123#key"`

var getCmd = &cobra.Command{
	Use:   "get [link]",
	Short: "Retrieve and decrypt a secret",
	Long:  getLong,
	Args:  cobra.ExactArgs(1),
	RunE:  runGet,
}

func init() {
	rootCmd.AddCommand(getCmd)
}

func runGet(cmd *cobra.Command, args []string) error {
	raw := args[0]

	parsed, err := url.Parse(raw)
	if err != nil {
		return fmt.Errorf("invalid link: %w", err)
	}

	keyStr := parsed.Fragment
	if keyStr == "" {
		return fmt.Errorf("link must contain encryption key after #")
	}

	parts := strings.Split(strings.Trim(parsed.Path, "/"), "/")
	if len(parts) < 2 {
		return fmt.Errorf("invalid link format")
	}
	id := parts[len(parts)-1]

	if id == "" {
		return fmt.Errorf("could not extract secret id from link")
	}

	serverURL, _ := cmd.Root().PersistentFlags().GetString("server")

	result, err := apiGet(serverURL, id)
	if err != nil {
		return err
	}

	plaintext, err := Decrypt(result.EncryptedData, keyStr)
	if err != nil {
		return err
	}

	fmt.Println(plaintext)

	return nil
}