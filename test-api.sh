#!/bin/bash

# HARD-POS PRO API Test Script
# Helvino Technologies Limited

BASE_URL="http://localhost:5000/api/v1"
TOKEN=""

echo "=========================================="
echo "HARD-POS PRO API Test Script"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
response=$(curl -s "$BASE_URL/health")
echo "$response" | jq '.'
echo ""

# Test 2: System Info
echo -e "${YELLOW}Test 2: System Info${NC}"
response=$(curl -s "$BASE_URL/info")
echo "$response" | jq '.'
echo ""

# Test 3: Login
echo -e "${YELLOW}Test 3: Login (admin/admin123)${NC}"
response=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

TOKEN=$(echo "$response" | jq -r '.data.token')

if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
  echo -e "${GREEN}✓ Login successful${NC}"
  echo "Token: ${TOKEN:0:50}..."
else
  echo -e "${RED}✗ Login failed${NC}"
  echo "$response" | jq '.'
  exit 1
fi
echo ""

# Test 4: Get Profile
echo -e "${YELLOW}Test 4: Get Profile${NC}"
response=$(curl -s "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $TOKEN")
echo "$response" | jq '.data.fullName, .data.role.roleName'
echo ""

# Test 5: Get Products
echo -e "${YELLOW}Test 5: Get Products${NC}"
response=$(curl -s "$BASE_URL/products?pageSize=5" \
  -H "Authorization: Bearer $TOKEN")
count=$(echo "$response" | jq '.pagination.totalItems')
echo -e "${GREEN}Total products: $count${NC}"
echo ""

# Test 6: Get Customers
echo -e "${YELLOW}Test 6: Get Customers${NC}"
response=$(curl -s "$BASE_URL/customers?pageSize=5" \
  -H "Authorization: Bearer $TOKEN")
count=$(echo "$response" | jq '.pagination.totalItems')
echo -e "${GREEN}Total customers: $count${NC}"
echo ""

# Test 7: Get Today's Sales
echo -e "${YELLOW}Test 7: Get Today's Sales${NC}"
response=$(curl -s "$BASE_URL/sales/today" \
  -H "Authorization: Bearer $TOKEN")
count=$(echo "$response" | jq '.data.count')
revenue=$(echo "$response" | jq '.data.totalRevenue')
echo -e "${GREEN}Today's sales: $count (Revenue: KES $revenue)${NC}"
echo ""

# Test 8: Get Dashboard
echo -e "${YELLOW}Test 8: Get Dashboard Stats${NC}"
response=$(curl -s "$BASE_URL/reports/dashboard" \
  -H "Authorization: Bearer $TOKEN")
echo "$response" | jq '.data'
echo ""

# Test 9: Get Stock
echo -e "${YELLOW}Test 9: Get Stock${NC}"
response=$(curl -s "$BASE_URL/inventory/stock?pageSize=5" \
  -H "Authorization: Bearer $TOKEN")
count=$(echo "$response" | jq '.pagination.totalItems')
echo -e "${GREEN}Total stock items: $count${NC}"
echo ""

# Test 10: Get Suppliers
echo -e "${YELLOW}Test 10: Get Suppliers${NC}"
response=$(curl -s "$BASE_URL/suppliers?pageSize=5" \
  -H "Authorization: Bearer $TOKEN")
count=$(echo "$response" | jq '.pagination.totalItems')
echo -e "${GREEN}Total suppliers: $count${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}All tests completed!${NC}"
echo "=========================================="
