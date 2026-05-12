```php
// Padrão correto
readonly class InventoryDTO
{
    public function __construct(
        public ?int $unidade_id = null,
        // ...
        public ?int $status_id = null,
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            unidade_id: $data['unidade_id'] ?? null,
            // auth() aqui é aceitável
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'unidade_id' => $this->unidade_id,
            // ...
        ], fn($v) => $v !== null);
    }
}
```
