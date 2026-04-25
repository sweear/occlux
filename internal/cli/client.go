package cli

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type createRequest struct {
	EncryptedData string `json:"encryptedData"`
	MaxViews      int    `json:"maxViews"`
	TTLMinutes    int    `json:"ttlMinutes"`
}

type createResponse struct {
	Success   bool      `json:"success"`
	ID        string    `json:"id"`
	ExpiresAt time.Time `json:"expiresAt"`
}

type getResponse struct {
	Success       bool   `json:"success"`
	EncryptedData string `json:"encryptedData"`
}

type errorResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

func apiCreate(serverURL, encryptedData string, maxViews, ttlMinutes int) (*createResponse, error) {
	body, err := json.Marshal(createRequest{
		EncryptedData: encryptedData,
		MaxViews:      maxViews,
		TTLMinutes:    ttlMinutes,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	resp, err := http.Post(serverURL+"/api/v1/secrets", "application/json", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to server: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		var errResp errorResponse
		json.NewDecoder(resp.Body).Decode(&errResp)
		return nil, fmt.Errorf("server error: %s", errResp.Error)
	}

	var result createResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &result, nil
}

func apiGet(serverURL, id string) (*getResponse, error) {
	resp, err := http.Get(serverURL + "/api/v1/secrets/" + id)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to server: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil, fmt.Errorf("secret not found or expired")
	}

	if resp.StatusCode != http.StatusOK {
		var errResp errorResponse
		json.NewDecoder(resp.Body).Decode(&errResp)
		return nil, fmt.Errorf("server error: %s", errResp.Error)
	}

	var result getResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &result, nil
}