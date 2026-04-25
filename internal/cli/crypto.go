package cli

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
)

const (
	keySize   = 32
	nonceSize = 12
)

func encode(b []byte) string {
	return base64.RawURLEncoding.EncodeToString(b)
}

func decode(s string) ([]byte, error) {
	return base64.RawURLEncoding.DecodeString(s)
}

func Encrypt(plaintext string) (encryptedData, keyStr string, err error) {
	key := make([]byte, keySize)
	if _, err = io.ReadFull(rand.Reader, key); err != nil {
		err = fmt.Errorf("failed to generate key: %w", err)
		return
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		err = fmt.Errorf("failed to create cipher: %w", err)
		return
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		err = fmt.Errorf("failed to create GCM: %w", err)
		return
	}

	nonce := make([]byte, nonceSize)
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		err = fmt.Errorf("failed to generate nonce: %w", err)
		return
	}

	ciphertext := gcm.Seal(nil, nonce, []byte(plaintext), nil)

	combined := make([]byte, nonceSize+len(ciphertext))
	copy(combined[:nonceSize], nonce)
	copy(combined[nonceSize:], ciphertext)

	encryptedData = encode(combined)
	keyStr = encode(key)
	return
}

func Decrypt(encryptedData, keyStr string) (string, error) {
	key, err := decode(keyStr)
	if err != nil {
		return "", fmt.Errorf("invalid key: %w", err)
	}

	combined, err := decode(encryptedData)
	if err != nil {
		return "", fmt.Errorf("invalid data: %w", err)
	}

	if len(combined) < nonceSize {
		return "", fmt.Errorf("data too short")
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", fmt.Errorf("failed to create cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create GCM: %w", err)
	}

	plaintext, err := gcm.Open(nil, combined[:nonceSize], combined[nonceSize:], nil)
	if err != nil {
		return "", fmt.Errorf("decryption failed, wrong key or corrupted data")
	}

	return string(plaintext), nil
}