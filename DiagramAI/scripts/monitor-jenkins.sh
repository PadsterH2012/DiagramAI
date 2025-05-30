#!/bin/bash

# Jenkins Build Monitor Script
# Usage: ./monitor-jenkins.sh [username] [api_token]

JENKINS_URL="http://hl-jenkins.techpad.uk:8080"
JOB_NAME="DiagramAI"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if credentials provided
if [ $# -eq 2 ]; then
    USERNAME="$1"
    API_TOKEN="$2"
    AUTH_HEADER="-u ${USERNAME}:${API_TOKEN}"
    echo -e "${GREEN}🔐 Using authentication: ${USERNAME}${NC}"
else
    AUTH_HEADER=""
    echo -e "${YELLOW}⚠️ No authentication provided - may require login${NC}"
fi

# Function to get build status
get_build_status() {
    curl -s ${AUTH_HEADER} "${JENKINS_URL}/job/${JOB_NAME}/lastBuild/api/json" | \
    python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f\"Build #{data['number']}: {data['result'] or 'RUNNING'}\")
    print(f\"Duration: {data.get('duration', 0) // 1000}s\")
    if data.get('building', False):
        print('Status: BUILDING')
    else:
        print(f\"Status: {data.get('result', 'UNKNOWN')}\")
except:
    print('Error getting build status')
"
}

# Function to get console output
get_console_output() {
    curl -s ${AUTH_HEADER} "${JENKINS_URL}/job/${JOB_NAME}/lastBuild/consoleText" | tail -20
}

# Function to check if build is running
is_build_running() {
    curl -s ${AUTH_HEADER} "${JENKINS_URL}/job/${JOB_NAME}/lastBuild/api/json" | \
    python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('true' if data.get('building', False) else 'false')
except:
    print('false')
" 2>/dev/null
}

echo -e "${BLUE}🚀 Starting Jenkins Build Monitor for ${JOB_NAME}${NC}"
echo -e "${BLUE}📡 Jenkins URL: ${JENKINS_URL}${NC}"
echo -e "${BLUE}⏰ Checking every 10 seconds...${NC}"
echo ""

# Initial status
echo -e "${YELLOW}📊 Initial Build Status:${NC}"
get_build_status
echo ""

# Monitor loop
ITERATION=0
while true; do
    ITERATION=$((ITERATION + 1))
    
    echo -e "${BLUE}=== Check #${ITERATION} - $(date) ===${NC}"
    
    # Get current build status
    BUILD_RUNNING=$(is_build_running)
    
    if [ "$BUILD_RUNNING" = "true" ]; then
        echo -e "${YELLOW}🔄 Build is running...${NC}"
        
        # Show recent console output
        echo -e "${BLUE}📝 Recent console output:${NC}"
        get_console_output | while IFS= read -r line; do
            # Color code different types of output
            if [[ $line == *"✅"* ]]; then
                echo -e "${GREEN}${line}${NC}"
            elif [[ $line == *"❌"* ]] || [[ $line == *"ERROR"* ]] || [[ $line == *"Failed"* ]]; then
                echo -e "${RED}${line}${NC}"
            elif [[ $line == *"⚠️"* ]] || [[ $line == *"WARNING"* ]]; then
                echo -e "${YELLOW}${line}${NC}"
            elif [[ $line == *"🔧"* ]] || [[ $line == *"🏗️"* ]] || [[ $line == *"🧪"* ]] || [[ $line == *"🌐"* ]]; then
                echo -e "${BLUE}${line}${NC}"
            else
                echo "$line"
            fi
        done
    else
        echo -e "${GREEN}✅ Build completed or not running${NC}"
        
        # Show final status
        echo -e "${BLUE}📊 Final Build Status:${NC}"
        get_build_status
        
        # Show last few lines of console
        echo -e "${BLUE}📝 Final console output:${NC}"
        get_console_output
        
        echo ""
        echo -e "${GREEN}🎉 Monitoring complete!${NC}"
        break
    fi
    
    echo ""
    echo -e "${BLUE}--- Waiting 10 seconds ---${NC}"
    sleep 10
done
