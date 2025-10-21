@echo off
echo ========================================
echo  Iniciando servidor local Next.js
echo ========================================
echo.

REM Verifica se node_modules existe
if not exist "node_modules\" (
    echo [INFO] Dependencias nao encontradas. Instalando...
    echo.
    pnpm install
    echo.
)

echo [INFO] Iniciando servidor de desenvolvimento...
echo [INFO] O aplicativo estara disponivel em: http://localhost:3000
echo.
echo Pressione Ctrl+C para parar o servidor
echo ========================================
echo.

pnpm dev
