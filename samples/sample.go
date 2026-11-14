// Package inventory exercises most Go token categories.
package inventory

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"sync"
	"time"
)

// Status is the lifecycle state of an item.
type Status int

const (
	StatusDraft Status = iota
	StatusActive
	StatusArchived
)

const (
	MaxItems       = 1_000
	taxRate        = 0.11
	defaultTimeout = 30 * time.Second
)

var (
	ErrFull    = errors.New("inventory: full")
	ErrInvalid = errors.New("inventory: invalid SKU")
	skuPattern = regexp.MustCompile(`^[A-Z]{3}-\d{4,6}$`)
)

// Item is anything that can be stored.
type Item interface {
	SKU() string
	Price() float64
}

// Product is a concrete Item.
type Product struct {
	ID     string  `json:"id"`
	Name   string  `json:"name,omitempty"`
	Cost   float64 `json:"cost"`
	Status Status  `json:"status"`
}

func (p Product) SKU() string    { return p.ID }
func (p Product) Price() float64 { return p.Cost * (1 + taxRate) }

func (s Status) String() string {
	switch s {
	case StatusDraft:
		return "draft"
	case StatusActive:
		return "active"
	default:
		return fmt.Sprintf("Status(%d)", int(s))
	}
}

// Store is a concurrency-safe, generic inventory.
type Store[T Item] struct {
	mu    sync.RWMutex
	items map[string]T
}

func NewStore[T Item]() *Store[T] {
	return &Store[T]{items: make(map[string]T)}
}

// Add validates and stores an item.
func (s *Store[T]) Add(ctx context.Context, item T) error {
	select {
	case <-ctx.Done():
		return ctx.Err()
	default:
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	if len(s.items) >= MaxItems {
		return ErrFull
	}
	if !skuPattern.MatchString(item.SKU()) {
		return fmt.Errorf("%w: %q", ErrInvalid, item.SKU())
	}
	s.items[item.SKU()] = item
	return nil
}

// Total sums prices concurrently.
func (s *Store[T]) Total() (total float64) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	results := make(chan float64, len(s.items))
	var wg sync.WaitGroup
	for _, item := range s.items {
		wg.Add(1)
		go func(it T) {
			defer wg.Done()
			results <- it.Price()
		}(item)
	}
	wg.Wait()
	close(results)

	for price := range results {
		total += price
	}
	return total
}

func Example() {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	store := NewStore[Product]()
	products := []Product{
		{ID: "ABC-1234", Name: "Widget", Cost: 99.5, Status: StatusActive},
		{ID: "bad sku", Cost: 0x10},
	}
	for i, p := range products {
		if err := store.Add(ctx, p); err != nil {
			fmt.Printf("item %d: %v\n", i, err)
			continue
		}
	}
	var ptr *Product = nil
	ok := ptr == nil && true
	fmt.Println(store.Total(), ok, 'x', len(products))
}
