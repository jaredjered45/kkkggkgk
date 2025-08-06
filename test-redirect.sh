#!/bin/bash

# Test script for webmail auth redirect
# This script tests the redirect functionality

set -e

echo "🧪 Testing Webmail Auth Redirect..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test URLs
SOURCE_DOMAIN="webmail-auth001.ibeddcoutsource.org"
TARGET_DOMAIN="webmail-auth001.molecullesoft.com"
TEST_PATH="/cpsess/prompt"
TEST_PARAMS="fromPWA=1&pwd=&_x_zm_rtaid=I7SQ3VePRPS/cndRs57BvQ.1709509974548/&_x_zm_rhtaid="

# Function to test redirect
test_redirect() {
    local url="$1"
    local description="$2"
    
    echo -e "\n${YELLOW}Testing: $description${NC}"
    echo "URL: $url"
    
    # Test with curl
    response=$(curl -s -I -w "%{http_code}|%{redirect_url}" "$url" 2>/dev/null || echo "ERROR|")
    
    # Parse response
    http_code=$(echo "$response" | tail -n1 | cut -d'|' -f1)
    redirect_url=$(echo "$response" | tail -n1 | cut -d'|' -f2)
    
    if [ "$http_code" = "301" ] || [ "$http_code" = "302" ]; then
        if [[ "$redirect_url" == *"$TARGET_DOMAIN"* ]]; then
            echo -e "${GREEN}✅ SUCCESS: Redirect working correctly${NC}"
            echo "HTTP Code: $http_code"
            echo "Redirect URL: $redirect_url"
        else
            echo -e "${RED}❌ FAILED: Redirect URL doesn't match target domain${NC}"
            echo "HTTP Code: $http_code"
            echo "Redirect URL: $redirect_url"
            return 1
        fi
    else
        echo -e "${RED}❌ FAILED: Expected redirect (301/302), got $http_code${NC}"
        return 1
    fi
}

# Function to test with verbose output
test_verbose() {
    local url="$1"
    echo -e "\n${YELLOW}Verbose test for: $url${NC}"
    curl -v "$url" 2>&1 | head -20
}

# Check if container is running
echo "🔍 Checking if container is running..."
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${RED}❌ Container is not running. Start it first:${NC}"
    echo "   docker-compose up -d"
    exit 1
fi

echo -e "${GREEN}✅ Container is running${NC}"

# Test 1: Specific encryption path with parameters
test_redirect "https://$SOURCE_DOMAIN$TEST_PATH?$TEST_PARAMS" "Encryption path with parameters"

# Test 2: Specific encryption path without parameters
test_redirect "https://$SOURCE_DOMAIN$TEST_PATH" "Encryption path without parameters"

# Test 3: General redirect
test_redirect "https://$SOURCE_DOMAIN/" "General redirect"

# Test 4: HTTP to HTTPS redirect
test_redirect "http://$SOURCE_DOMAIN$TEST_PATH?$TEST_PARAMS" "HTTP to HTTPS redirect"

# Test 5: Verbose test for debugging
test_verbose "https://$SOURCE_DOMAIN$TEST_PATH?$TEST_PARAMS"

echo -e "\n${GREEN}🎉 All tests completed!${NC}"

# Summary
echo -e "\n${YELLOW}📊 Test Summary:${NC}"
echo "Source Domain: $SOURCE_DOMAIN"
echo "Target Domain: $TARGET_DOMAIN"
echo "Test Path: $TEST_PATH"
echo "Test Parameters: $TEST_PARAMS"

echo -e "\n${YELLOW}📝 Next Steps:${NC}"
echo "1. Verify DNS resolution for $SOURCE_DOMAIN"
echo "2. Check SSL certificates are valid"
echo "3. Monitor logs: docker-compose logs -f"
echo "4. Test from a real browser"