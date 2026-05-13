# test-failover.ps1
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Тестирование отказоустойчивости" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Функция для запросов
function Get-Server {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost/" -Method Get -TimeoutSec 5
        return $response.server
    }
    catch {
        return "ОШИБКА"
    }
}

# 1. Нормальная работа
Write-Host "1. Нормальная работа (все серверы):" -ForegroundColor Yellow
for ($i = 1; $i -le 4; $i++) {
    $server = Get-Server
    Write-Host "   Запрос $i : $server" -ForegroundColor Green
}

# 2. Останавливаем backend1
Write-Host "`n2. Останавливаем backend1..." -ForegroundColor Red
docker stop backend1
Write-Host "   Ждём 35 секунд (fail_timeout)..." -ForegroundColor Yellow
Start-Sleep -Seconds 35

Write-Host "`n3. Запросы после остановки backend1:" -ForegroundColor Yellow
for ($i = 1; $i -le 6; $i++) {
    $server = Get-Server
    Write-Host "   Запрос $i : $server" -ForegroundColor Green
}

# 3. Запускаем backend1 обратно
Write-Host "`n4. Запускаем backend1..." -ForegroundColor Green
docker start backend1
Write-Host "   Ждём 10 секунд..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "`n5. Запросы после восстановления backend1:" -ForegroundColor Yellow
for ($i = 1; $i -le 6; $i++) {
    $server = Get-Server
    Write-Host "   Запрос $i : $server" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Тестирование завершено!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan