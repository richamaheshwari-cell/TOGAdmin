#!/bin/bash
set -e

FILES=$(grep -R -l "toLocaleString\|toLocaleDateString" src/app --include="*.tsx" --include="*.ts")

# Fix new Date(X).toLocaleDateString() with no args
echo "$FILES" | xargs perl -pi -e 's/new Date\(([^)]+)\)\.toLocaleDateString\(\)/new Date($1).toLocaleDateString("en-US", { timeZone: "UTC" })/g'

# Fix new Date(X).toLocaleString() with no args  
echo "$FILES" | xargs perl -pi -e 's/new Date\(([^)]+)\)\.toLocaleString\(\)/new Date($1).toLocaleString("en-US", { timeZone: "UTC" })/g'

# Fix date variable .toLocaleDateString() (helper functions in casinos, dashboard, bonuses, games pages)
echo "$FILES" | xargs perl -pi -e 's/(\bdate\b)\.toLocaleDateString\(\)/$1.toLocaleDateString("en-US", { timeZone: "UTC" })/g'

# Fix existing "en-US" calls that are missing timeZone
echo "$FILES" | xargs perl -pi -e 's/\.toLocaleString\("en-US", \{ dateStyle: "short", timeStyle: "short" \}\)/.toLocaleString("en-US", { dateStyle: "short", timeStyle: "short", timeZone: "UTC" })/g'
echo "$FILES" | xargs perl -pi -e 's/\.toLocaleDateString\("en-US", \{ month: "short", day: "numeric", year: "numeric" \}\)/.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })/g'
echo "$FILES" | xargs perl -pi -e 's/\.toLocaleString\("en-US", \{ month: "short", day: "numeric", hour: "numeric", minute: "2-digit" \}\)/.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" })/g'

echo "All date fixes applied."
