```php
// Padrão correto para store()
public function store(CommandDTO $dto): ResponseDTO
{
    // create() já retorna o model com relações carregadas via load() no Repository
    return ResponseDTO::fromModel($this->repository->create($dto->toArray()));
}

// Padrão correto para update()
public function update(Model $model, CommandDTO $dto): ResponseDTO
{
    return DB::transaction(function () use ($model, $dto) {
        // update() já retorna o model com relações carregadas via load() no Repository
        $updated = $this->repository->update($model, $dto->toArray());
        return ResponseDTO::fromModel($updated);
    });
}
```
