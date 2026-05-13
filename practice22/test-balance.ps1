# test-balance.ps1
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Тестирование балансировки нагрузки" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Description,
        [int]$Count = 5
    )
    
    Write-Host "=== $Description ===" -ForegroundColor Yellow
    Write-Host "URL: $Url`n"
    
    for ($i = 1; $i -le $Count; $i++) {
        try {
            $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 5
            $server = $response.server
            $timestamp = $response.timestamp
            Write-Host "  Запрос $i : $server" -ForegroundColor Green
        }
        catch {
            Write-Host "  Запрос $i : ОШИБКА - $($_.Exception.Message)" -ForegroundColor Red
        }
        Start-Sleep -Milliseconds 500
    }
    Write-Host ""
}

# Основные тесты
Test-Endpoint -Url "http://localhost/" -Description "Порт 80 (Health Checks)" -Count 6
Test-Endpoint -Url "http://localhost:8001/" -Description "Порт 8001 (Round Robin)" -Count 6
Test-Endpoint -Url "http://localhost:8002/" -Description "Порт 8002 (Least Connections)" -Count 6
Test-Endpoint -Url "http://localhost:8003/" -Description "Порт 8003 (IP Hash)" -Count 6

# Тест разных эндпоинтов
Write-Host "=== Дополнительные эндпоинты ===" -ForegroundColor Yellow

$endpoints = @(
    "/api/health",
    "/api/users",
    "/api/products",
    "/api/info"
)

foreach ($endpoint in $endpoints) {
    try {
        $url = "http://localhost$endpoint"
        $response = Invoke-RestMethod -Uri $url -Method Get
        Write-Host "  $endpoint : OK (сервер: $($response.server))" -ForegroundColor Green
    }
    catch {
        Write-Host "  $endpoint : ОШИБКА" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Тестирование завершено!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan