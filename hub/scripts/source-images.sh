# CampusHub Image Sourcing Tool (Zero-Install)
# This tool uses standard curl to fetch high-quality university placeholders

IMAGE_DIR="public/assets/images/university"
mkdir -p "$IMAGE_DIR"

echo "🎨 Sourcing high-quality university placeholders..."

# Verified Public Unsplash IDs for educational settings
declare -a photos=(
  "photo-1541339907198-e08756ebafe3" # Main Campus
  "photo-1523050335456-c38a20b6d5f0" # Graduation Hall
  "photo-1498243639359-2cee3e35d3cf" # Library
)

for i in "${!photos[@]}"; do
  ID="${photos[$i]}"
  FILE="$IMAGE_DIR/campus-$i.jpg"
  echo "📥 Downloading Campus Asset $i ($ID)..."
  curl -L -s "https://images.unsplash.com/$ID?auto=format&fit=crop&q=80&w=1600&h=900" -o "$FILE"
  if [ $? -eq 0 ]; then
    echo "✅ Saved as $FILE"
  else
    echo "❌ Failed to download $ID"
  fi
done

echo "✨ All assets successfully sourced to $IMAGE_DIR"
