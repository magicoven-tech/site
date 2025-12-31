#!/bin/bash
# Script para substituir todas as chamadas fetch por apiRequest no cms-admin.js

# Backup
cp js/cms-admin.js js/cms-admin.js.bak

# Substitui fetch('/api/blog' por apiRequest('/api/blog'
sed -i '' "s/await fetch('\\/api\\/blog'/await apiRequest('\\/api\\/blog'/g" js/cms-admin.js

# Substitui fetch('/api/projects' por apiRequest('/api/projects'
sed -i '' "s/await fetch('\\/api\\/projects'/await apiRequest('\\/api\\/projects'/g" js/cms-admin.js

# Substitui fetch(`/api/ por apiRequest(`/api/
sed -i '' 's/await fetch(`\/api\//await apiRequest(`\/api\//g' js/cms-admin.js

# Remove credentials: 'include' pois não é mais necessário com JWT
sed -i '' '/credentials: .include./d' js/cms-admin.js

echo "✅ Substituições concluídas!"
echo "📝 Backup salvo em: js/cms-admin.js.bak"
