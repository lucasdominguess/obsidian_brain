```php
public function create(array $data): Model
{
    return Model::create($data)->load($this->withRelations());
}

public function update(Model $model, array $data): Model
{
    $model->update($data);
    return $model->load($this->withRelations());
}

private function withRelations(): array
{
    return ['relacao1', 'relacao2.subrelacao'];
}
```
