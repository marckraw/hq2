#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧹 Starting complete project cleanup...${NC}"
echo ""

# Function to remove directories
remove_dirs() {
    local pattern=$1
    local description=$2
    
    echo -e "${YELLOW}Removing ${description}...${NC}"
    find . -name "${pattern}" -type d -prune -exec rm -rf '{}' + 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ ${description} removed${NC}"
    else
        echo -e "${RED}⚠ No ${description} found or error occurred${NC}"
    fi
    echo ""
}

# Remove node_modules directories
remove_dirs "node_modules" "node_modules directories"

# Remove .next directories (Next.js cache)
remove_dirs ".next" ".next directories (Next.js cache)"

# Remove dist directories (TypeScript build output)
remove_dirs "dist" "dist directories (TypeScript builds)"

# Remove build directories
remove_dirs "build" "build directories"

# Remove .turbo directories (Turbo cache)
remove_dirs ".turbo" ".turbo directories (Turbo cache)"

# Remove tsconfig.tsbuildinfo files (TypeScript incremental compilation cache)
echo -e "${YELLOW}Removing TypeScript build info files...${NC}"
find . -name "tsconfig.tsbuildinfo" -type f -delete 2>/dev/null
find . -name "*.tsbuildinfo" -type f -delete 2>/dev/null
echo -e "${GREEN}✓ TypeScript build info files removed${NC}"
echo ""

# Remove .cache directories
remove_dirs ".cache" ".cache directories"

# Remove coverage directories (test coverage reports)
remove_dirs "coverage" "coverage directories"

# Clear pnpm cache
echo -e "${YELLOW}Clearing pnpm cache...${NC}"
if command -v pnpm &> /dev/null; then
    pnpm store prune 2>/dev/null
    echo -e "${GREEN}✓ pnpm cache cleared${NC}"
else
    echo -e "${RED}⚠ pnpm not found in PATH${NC}"
fi
echo ""

# Remove pnpm-lock.yaml to force fresh install (optional - commented out by default)
# echo -e "${YELLOW}Removing pnpm-lock.yaml...${NC}"
# rm -f pnpm-lock.yaml
# echo -e "${GREEN}✓ pnpm-lock.yaml removed${NC}"
# echo ""

# Remove any .parcel-cache directories (if using Parcel)
remove_dirs ".parcel-cache" ".parcel-cache directories"

# Remove any storybook-static directories (if using Storybook)
remove_dirs "storybook-static" "storybook-static directories"

# Summary
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Cleanup complete!${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. Run: ${YELLOW}pnpm install${NC} to reinstall dependencies"
echo -e "  2. Run: ${YELLOW}pnpm dev${NC} to start development"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"