<?php

declare(strict_types=1);

namespace NubiBuilds\Inventory;

use InvalidArgumentException;
use JsonSerializable;
use NubiBuilds\Inventory\Contracts\{Item, Repository as RepositoryContract};

use function array_filter;
use function sprintf;

const MAX_ITEMS = 1000;

enum Status: string
{
    case Draft = 'draft';
    case Active = 'active';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Active => 'Active',
            default => 'Archived',
        };
    }
}

#[\Attribute(\Attribute::TARGET_METHOD)]
final class Cached
{
    public function __construct(public readonly int $ttl = 60) {}
}

trait Timestamps
{
    protected ?\DateTimeImmutable $createdAt = null;

    public function touch(): static
    {
        $this->createdAt ??= new \DateTimeImmutable('now');
        return $this;
    }
}

/**
 * A product in the inventory.
 *
 * @property-read string $sku
 * @method static self fromArray(array $data)
 */
final class Product implements Item, JsonSerializable
{
    use Timestamps;

    public const TAX_RATE = 0.11;
    private static int $count = 0;

    public function __construct(
        public readonly string $sku,
        private string $name,
        private float $price = 0.0,
        private Status $status = Status::Draft,
    ) {
        if (!preg_match('/^[A-Z]{3}-\d{4,6}$/', $sku)) {
            throw new InvalidArgumentException("Invalid SKU: {$sku}");
        }
        self::$count++;
    }

    /**
     * @param array<string, mixed> $data Raw product data.
     * @return static
     * @throws InvalidArgumentException When the SKU is malformed.
     */
    public static function fromArray(array $data): static
    {
        return new static($data['sku'], $data['name'] ?? 'Untitled', (float) ($data['price'] ?? 0));
    }

    #[Cached(ttl: 300)]
    public function total(int $quantity = 1): float
    {
        return round($this->price * $quantity * (1 + self::TAX_RATE), 2);
    }

    /** @deprecated 2.0 Use total() instead. */
    public function getTotal(): float
    {
        return $this->total();
    }

    public function jsonSerialize(): array
    {
        return [
            'sku' => $this->sku,
            'name' => $this->name,
            'status' => $this->status->value,
            'active' => $this->status === Status::Active,
            'createdAt' => $this->createdAt?->format(DATE_ATOM),
        ];
    }
}

$products = array_map(Product::fromArray(...), [
    ['sku' => 'ABC-1234', 'name' => 'Widget', 'price' => 99.5],
    ['sku' => 'XYZ-0001', 'price' => 0x10],
]);

$expensive = array_filter($products, fn (Product $p): bool => $p->total() > 50);

foreach ($expensive as $index => $product) {
    echo sprintf("%d: %s\n", $index, json_encode($product->touch(), JSON_PRETTY_PRINT));
}

$heredoc = <<<TEXT
    Total products: {$products[0]->sku} and others
    Limit: ${MAX_ITEMS}
    TEXT;

echo $heredoc, PHP_EOL, null ?? 'none', true && !false;
?>
<p class="count"><?= count($products) ?> products</p>
