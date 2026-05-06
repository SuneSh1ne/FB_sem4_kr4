#!/bin/bash

echo "=========================================="
echo "Тестирование балансировки в Docker"
echo "=========================================="

# Функция тестирования
test_balance() {
    local port=$1
    local description=$2
    
    echo ""
    echo "$description (порт $port):"
    echo "----------------------------------------"
    for i in {1..10}; do
        response=$(curl -s http://localhost:$port/)
        server=$(echo $response | jq -r '.server // "unknown"')
        echo "Запрос $i: $server"
    done
}

# Проверка работы Docker
if ! docker ps &> /dev/null; then
    echo "Ошибка: Docker не запущен или нет прав на выполнение"
    exit 1
fi

# Проверка, что контейнеры запущены
if ! docker ps | grep -q "nginx-balancer"; then
    echo "Ошибка: Контейнеры не запущены. Выполните:"
    echo "  docker compose up -d"
    exit 1
fi

# Тестирование основного порта
test_balance 80 "Nginx с Health Checks"

# Тестирование Round Robin
test_balance 8001 "Nginx Round Robin"

# Тестирование Least Connections
test_balance 8002 "Nginx Least Connections"

# Тестирование IP Hash
test_balance 8003 "Nginx IP Hash"

echo ""
echo "=========================================="
echo "Тестирование отказоустойчивости"
echo "=========================================="
echo ""
echo "Остановка backend1..."
docker stop backend1
echo "Ожидание обнаружения отказа (30 секунд)..."
sleep 30

echo ""
echo "Тестирование после отказа backend1:"
for i in {1..5}; do
    response=$(curl -s http://localhost/)
    server=$(echo $response | jq -r '.server // "unknown"')
    echo "Запрос $i: $server"
done

echo ""
echo "Запуск backend1..."
docker start backend1
sleep 1

echo ""
echo "=========================================="
echo "Тестирование завершено"
echo "=========================================="