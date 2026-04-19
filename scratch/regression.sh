#!/bin/bash

# Cores para o output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "==== Iniciando Testes Regressivos (Magic Oven) ===="

# 1. Health Check
echo -n "Testando Health Check... "
HEALTH=$(curl -s http://localhost:3000/api/health)
if [[ $HEALTH == *"\"status\":\"ok\""* ]]; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL${NC} ($HEALTH)"
fi

# 2. Listar Blog Posts
echo -n "Testando Listagem de Blog... "
BLOG=$(curl -s http://localhost:3000/api/blog)
if [[ $BLOG == *"\"posts\":"* ]]; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL${NC}"
fi

# 3. Listar Projetos
echo -n "Testando Listagem de Projetos... "
PROJECTS=$(curl -s http://localhost:3000/api/projects)
if [[ $PROJECTS == *"\"projects\":"* ]]; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL${NC}"
fi

# 4. Testar Envio de Mensagem (Contato)
echo -n "Testando Simulação de Contato... "
MESSAGE_DATA="name=Teste Antigravity&email=teste@example.com&message=Teste de regressão automático"
MSG_RES=$(curl -s -X POST -d "$MESSAGE_DATA" http://localhost:3000/api/messages)
if [[ $MSG_RES == *"\"success\":true"* ]]; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL${NC} ($MSG_RES)"
fi

echo "==== Fim dos Testes ===="
