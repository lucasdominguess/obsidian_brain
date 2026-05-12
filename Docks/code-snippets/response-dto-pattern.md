```php
// Padrão correto
readonly class InventoryResponseDTO
{
    public function __construct(
        public ?int $id = null,
        public ?array $status = null,
        // ...
    ) {}

    public static function fromModel(Model $model): self
    {
        return new self(
            id: $model->id,
            status: $model->status ? [
                'id'     => $model->status->id,
                'status' => $model->status->status,
            ] : null,
        );
    }

    public function toArray(): array
    {
        return [
            'id'     => $this->id,
            'status' => $this->status,
        ];
    }
}
```
