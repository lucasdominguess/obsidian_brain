@echo off
:: Pega o caminho exato de onde o script está sendo executado (Raiz do Obsidian)
set "OBSIDIAN_PATH=%~dp0"
:: Remove a barra final da variável dp0
set "OBSIDIAN_PATH=%OBSIDIAN_PATH:~0,-1%"

:: Pega o diretório atual onde o terminal foi aberto (Seu projeto)
set "PROJECT_PATH=%cd%\.brain"

echo Criando link da base de conhecimento (.brain)...
mklink /D "%PROJECT_PATH%" "%OBSIDIAN_PATH%"

if %errorlevel% neq 0 (
    echo.
    echo ⚠️ ATENCAO: Se falhou por "Privilegios insuficientes", voce precisa abrir o terminal como Administrador, ou ativar o "Modo de Desenvolvedor" nas configuracoes do Windows.
) else (
    echo.
    echo ✅ Sucesso! O conhecimento foi mapeado localmente.
)
