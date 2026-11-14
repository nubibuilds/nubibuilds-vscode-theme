package com.nubibuilds.samples;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.function.Predicate;
import java.util.regex.Pattern;

/**
 * Inventory sample: exercises most Java token categories.
 *
 * @param <T> the item type held by the inventory
 * @author NubiBuilds
 * @see java.util.Map
 * @since 1.0
 */
@SuppressWarnings({"unchecked", "rawtypes"})
public final class Sample<T extends Sample.Item> implements AutoCloseable {

    public static final int MAX_ITEMS = 1_000;
    private static final double TAX_RATE = 0.11d;
    private static final long TIMEOUT_MS = 30_000L;
    private static final Pattern SKU = Pattern.compile("^[A-Z]{3}-\\d{4,6}$");

    /** Lifecycle of an item. */
    public enum Status {
        DRAFT, ACTIVE, ARCHIVED;

        boolean isVisible() {
            return this != ARCHIVED;
        }
    }

    public interface Item {
        String sku();

        default boolean valid() {
            return SKU.matcher(sku()).matches();
        }
    }

    public record Product(String sku, String name, double price, Status status) implements Item {}

    @FunctionalInterface
    interface Listener<E> {
        void onEvent(E event) throws Exception;
    }

    private final Map<String, T> items = new java.util.HashMap<>();
    private final List<Listener<? super T>> listeners = new ArrayList<>();
    private volatile boolean closed = false;

    /**
     * Adds an item.
     *
     * @param item the item to add
     * @return {@code true} if the item was stored
     * @throws IllegalStateException if the inventory is full
     */
    public synchronized boolean add(T item) {
        if (items.size() >= MAX_ITEMS) {
            throw new IllegalStateException("Inventory full: " + items.size());
        }
        if (item == null || !item.valid()) {
            return false;
        }
        items.put(item.sku(), item);
        for (Listener<? super T> listener : listeners) {
            try {
                listener.onEvent(item);
            } catch (Exception e) {
                System.err.printf("listener failed: %s%n", e.getMessage());
            }
        }
        return true;
    }

    public Optional<T> find(Predicate<? super T> predicate) {
        return items.values().stream().filter(predicate).findFirst();
    }

    /** @deprecated use {@link #find(Predicate)} instead. */
    @Deprecated(since = "2.0", forRemoval = true)
    public T get(String sku) {
        return items.get(sku);
    }

    public CompletableFuture<Double> totalAsync() {
        return CompletableFuture.supplyAsync(() -> items.values().stream()
                .filter(Product.class::isInstance)
                .map(Product.class::cast)
                .mapToDouble(p -> p.price() * (1 + TAX_RATE))
                .sum())
            .orTimeout(TIMEOUT_MS, java.util.concurrent.TimeUnit.MILLISECONDS);
    }

    @Override
    public void close() {
        closed = true;
        items.clear();
    }

    public static void main(String[] args) throws Exception {
        try (var inventory = new Sample<Product>()) {
            inventory.add(new Product("ABC-1234", "Widget", 99.5, Status.ACTIVE));
            var text = """
                Total: %.2f
                Closed: %b
                """.formatted(inventory.totalAsync().get(), inventory.closed);
            System.out.println(text + Duration.ofMillis(TIMEOUT_MS) + '\n');
            char marker = inventory.get("ABC-1234") instanceof Product p && p.status().isVisible() ? '+' : '-';
            int[] counts = {0x1F, 0b1010, 017};
            System.out.println(marker + " " + counts.length);
        }
    }
}
