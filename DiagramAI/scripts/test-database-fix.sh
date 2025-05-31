#!/bin/bash

# Test script to verify database table creation fix
# This script tests the API endpoint that was failing

echo "🧪 Testing Database Table Fix"
echo "============================="

# Check if application is running
if ! curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "❌ Application is not running on http://localhost:3000"
    echo "   Please start the application first with: docker compose up -d"
    exit 1
fi

echo "✅ Application is running"

# Test health endpoint
echo ""
echo "🏥 Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3000/api/health)
echo "Health response: $HEALTH_RESPONSE"

# Test diagrams API endpoint (the one that was failing)
echo ""
echo "📊 Testing diagrams API endpoint..."
DIAGRAMS_RESPONSE=$(curl -s -w "HTTP_STATUS:%{http_code}" http://localhost:3000/api/diagrams)

HTTP_STATUS=$(echo $DIAGRAMS_RESPONSE | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo $DIAGRAMS_RESPONSE | sed 's/HTTP_STATUS:[0-9]*$//')

echo "HTTP Status: $HTTP_STATUS"
echo "Response Body: $BODY"

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ SUCCESS: Diagrams API is working correctly"
    echo "   The database table issue has been resolved!"
elif [ "$HTTP_STATUS" = "503" ]; then
    echo "⚠️  SERVICE UNAVAILABLE: Database may still be initializing"
    echo "   This is expected during startup. Try again in a few moments."
else
    echo "❌ FAILED: Unexpected response from diagrams API"
    echo "   The database table issue may still exist"
fi

echo ""
echo "🔍 Testing table existence through health endpoint..."
TABLE_INFO=$(echo $HEALTH_RESPONSE | grep -o '"tables":\[[^]]*\]' || echo "No table info found")
echo "Table information: $TABLE_INFO"

if echo $TABLE_INFO | grep -q "diagrams"; then
    echo "✅ SUCCESS: 'diagrams' table detected in health check"
else
    echo "❌ FAILED: 'diagrams' table not found in health check"
fi

echo ""
echo "📝 Test Summary:"
echo "   - Health endpoint: $([ $? -eq 0 ] && echo "✅ Working" || echo "❌ Failed")"
echo "   - Diagrams API: $([ "$HTTP_STATUS" = "200" ] && echo "✅ Working" || echo "❌ Failed")"
echo "   - Tables detected: $(echo $TABLE_INFO | grep -o '\[.*\]' || echo "None")"