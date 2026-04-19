---
id: '1776594953157'
title: Rodamos IA local em um Mac Pro de 2009 OU ressuscitando gigantes
slug: rodamos-ia-local-em-um-mac-pro-de-2009-ou-ressuscitando-gigantes
category: CÓDIGO
excerpt: >-
  No Magic Oven, acreditamos que o design não termina na interface, ele começa
  no hardware. Recentemente, decidimos desafiar a obsolescência planejada.
  Tivemos acesso a um Mac Pro 2009 (um tanque de guerra de alumínio com 17 anos
  de estrada) e decidimos transformá-lo em um assistente de IA moderno e
  totalmente offline, sem nuvem, sem assinaturas, apenas metal e código.


  Se você tem um hardware antigo encostado, este guia é para você. Vamos tirar a
  poeira do terminal e colocar esse silício para trabalhar.
author: Magic Oven
tags:
  - código
  - hardware
  - IA
featured: true
published: true
author_username: brunonepomuceno
date: '2026-04-19'
content: >
  ## Um tanque de guerra cansado

  Muitos diriam para vender as peças ou usar como peso de porta. Mas o Mac Pro
  2009 é uma obra de arte da engenharia industrial. 

  Para entender o desafio, imagine rodar modelos de linguagem modernos em uma
  máquina que nasceu antes do Instagram.

  <br>

  No entanto, para rodar IAs modernas, ele tem "alguns" desafios:



  ![Mac Pro 2009](/uploads/image-1776599180789-729864221.png)



  - Processadores: 2x Intel Xeon E5620 (8 núcleos/16 threads). Potente na época,
  mas sem as instruções de IA de hoje.

  - Memória: 4.8GB de RAM. (onde um chrome aberto já é um desafio, é menos do
  que um smartphone médio hoje).

  - GPU: ATI Radeon HD 5770 com 1GB de VRAM.

  - OS: Zorin OS (Linux), a escolha certa para quem quer performance sem abrir
  mão da estética.


  ## O vale das sombras (o que NÃO funcionou)

  Antes de chegarmos à vitória, falhamos e falhar é parte do processo de design.

  1. AirLLM: Tentamos o AirLLM para rodar modelos grandes via Swap. Foi um
  desastre. A latência do disco transformou a IA em uma máquina de escrever
  preguiçosa.

  2. Aceleração por GPU (Vulkan): Tentamos usar o 1GB da Radeon para acelerar os
  cálculos. O erro? Modelos modernos de 3B ou 7B parâmetros simplesmente não
  cabem na memória de vídeo de 2009. A tentativa de compilar com Vulkan resultou
  em erros de shader e frustração.

  3. Phi-2: O modelo da Microsoft é rápido, mas em nosso hardware ele "pirou".
  Começou a repetir diálogos e alucinar formatos de chat. Foi rápido, mas não
  era útil.


  ## Llama-3.2-3B e o artesanato digital

  A virada de chave foi entender que não precisávamos de força bruta, mas de
  equilíbrio. Escolhemos o Llama-3.2-3B. Ele é inteligente o suficiente para
  entender português e leve o suficiente para morar na nossa RAM limitada.


  ### Passo 1: Preparando o terreno (dependências)

  O Linux precisa de ferramentas para compilar o llama.cpp. Abra o terminal e
  instale o essencial:

  ```Bash

  sudo apt update

  sudo apt install git build-essential cmake libcurl4-openssl-dev -y

  ```



  ### Passo 2: Construindo o motor (llama.cpp)

  Não vamos baixar um executável pronto, vamos compilar o código especificamente
  para os nossos Xeons.

  ```Bash

  cd /media/magicoven/storage/  # ou a pasta de sua preferência

  git clone https://github.com/ggerganov/llama.cpp

  cd llama.cpp

  mkdir build

  cd build


  # compilando focado em CPU (desativando Vulkan para evitar conflitos)

  cmake .. -DGGML_VULKAN=OFF

  cmake --build . --config Release -j$(nproc)

  ```



  ### Passo 3: Baixando o modelo (a IA propriamente dita)

  Escolhemos o Llama-3.2-3B-Instruct da Meta. Ele é o equilíbrio perfeito entre
  inteligência e leveza.


  1. Vá ao Hugging Face.

  2. Procure pela versão Q4_K_M (é a quantização ideal, boa precisão sem ocupar
  muita RAM).

  3. Salve o arquivo .gguf na sua pasta de storage.


  ## Engenharia de memória

  Com apenas 4.8GB de RAM, o Mac Pro engasgaria. A solução técnica foi
  implementar o zRAM, um sistema que compacta dados na RAM antes de jogá-los
  para o HD lento.


  ### Configurando o "pulmão virtual"

  Edite o arquivo de sistema:

  ```Bash

  sudo nano /usr/bin/init-zram-swapping

  ```



  Cole este script (que otimizamos para prioridade máxima):

  ```Bash

  #!/bin/sh

  # calcula a memória (reservando metade da RAM real para compactação)

  mem=$(free -b | grep Mem | awk '{print $2}')

  zram_size=$((mem / 2))


  # inicializa o dispositivo zram0 com prioridade 100

  zramctl --find --size $zram_size

  mkswap /dev/zram0

  swapon -p 100 /dev/zram0

  ```



  Reinicie o serviço: 

  ```Bash

  sudo systemctl restart zram-config.

  ```


  Prioridade 100 força o Linux a usar a zRAM antes do HD swapon -p 100 /dev/zram


  ```Bash

  # Verificando se a hierarquia de memória está correta

  swapon --show

  ```


  O resultado deve mostrar o /dev/zram0 com prioridade 100.


  ## O Comando llama-3b (automação)

  Como UX Engineers, odiamos fricção. Não queremos digitar 10 linhas de comando
  toda vez que precisamos de um insight. Criamos um script que limpa a casa e
  inicia a IA com prioridade total do sistema.


  Criamos um executável em /usr/local/bin/llama-3b.


  Crie o arquivo:


  ```Bash

  sudo nano /usr/local/bin/llama-3b

  ```



  Adicione o código abaixo:


  ```Bash

  #!/bin/zsh

  echo "faxina: limpando cache e swap..."

  sudo sync && echo 3 | sudo tee /proc/sys/vm/drop_caches

  sudo swapoff -a && sudo swapon -a


  echo "iniciando Llama-3.2-3B com prioridade máxima..."

  # Usamos 6 threads: o equilíbrio perfeito para arquiteturas Dual-CPU

  sudo nice -n -10 /media/magicoven/storage/llama.cpp/build/bin/llama-cli \
    -m /media/magicoven/storage/Llama-3.2-3B-Instruct-Q4_K_M.gguf \
    --threads 6 \
    --ctx-size 2048 \
    --batch-size 128 \
    --mlock \
    --no-mmap \
    --color on \
    --conversation
  ```



  Dê permissão de execução: 

  ```Bash 

  sudo chmod +x /usr/local/bin/llama-3b

  ```


  ## A Realidade pés no chão

  No design, a teoria é linda, mas o uso real é o que importa. Testamos nossa
  configuração em diferentes cenários de estresse. Entender a relação entre
  threads e o que está aberto no seu navegador (como o chrome) é crucial para
  não travar sua produtividade.


  Abaixo, você pode explorar como o número de threads e o uso do navegador
  afetam a velocidade de resposta (tokens por segundo) no nosso hardware
  específico.


  {simulador}


  ## Lições de um Mac Pro em 2026

  Fazer algo funcionar onde outros desistiram é a essência do que fazemos na
  Magic Oven. Não se trata de ter a melhor ferramenta, mas de ser os melhores
  artesões com a ferramenta que você tem em mãos.


  O Llama-3.2-3B rodando em um Mac Pro 2009 nos ensinou que o "impossível" é
  apenas um problema de design mal resolvido. Hoje, temos uma IA que gera 1.8
  t/s mesmo com 11 abas do Chrome abertas, e que chega a 2.5 t/s em modo foco.
  Não é a velocidade da luz, mas é a velocidade de uma conversa humana. É uma IA
  que roda no silêncio do nosso estúdio, sem enviar dados para servidores de
  terceiros.

  Para um designer, ter essa ferramenta rodando localmente, sem depender de
  nuvem e respeitando o hardware que já possuímos, é a forma mais pura de
  liberdade técnica.



  <div style="padding:123.57% 0 0 0;position:relative;"><iframe
  src="https://player.vimeo.com/video/1184546571?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&amp;autoplay=1&amp;muted=1&amp;loop=1"
  frameborder="0" allow="autoplay; fullscreen; picture-in-picture;
  clipboard-write; encrypted-media; web-share"
  referrerpolicy="strict-origin-when-cross-origin"
  style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Rodamos
  IA local em um Mac Pro de 2009 OU ressuscitando
  gigantes"></iframe></div><script
  src="https://player.vimeo.com/api/player.js"></script>




  Não precisamos da última Big Tech vendendo sonhos em subscrições mensais.
  Precisamos de artesanato digital. O hardware de 2009 ainda tem alma, só
  precisava de um pouco de zRAM e respeito.


  ### Dicas para quem quer seguir este caminho:

  - Esqueça a GPU antiga: Se ela tem menos de 4GB de VRAM, foque em uma CPU com
  boas threads.

  - Use quantização: Modelos GGUF (Q4_K_M) são o equilíbrio perfeito entre
  inteligência e peso.

  - Cuide da RAM: zRAM é obrigatório para máquinas com menos de 8GB.


  **Stay hungry, stay foolish and keep coding.**
---
## Um tanque de guerra cansado
Muitos diriam para vender as peças ou usar como peso de porta. Mas o Mac Pro 2009 é uma obra de arte da engenharia industrial. 
Para entender o desafio, imagine rodar modelos de linguagem modernos em uma máquina que nasceu antes do Instagram.
<br>
No entanto, para rodar IAs modernas, ele tem "alguns" desafios:


![Mac Pro 2009](/uploads/image-1776599180789-729864221.png)


- Processadores: 2x Intel Xeon E5620 (8 núcleos/16 threads). Potente na época, mas sem as instruções de IA de hoje.
- Memória: 4.8GB de RAM. (onde um chrome aberto já é um desafio, é menos do que um smartphone médio hoje).
- GPU: ATI Radeon HD 5770 com 1GB de VRAM.
- OS: Zorin OS (Linux), a escolha certa para quem quer performance sem abrir mão da estética.

## O vale das sombras (o que NÃO funcionou)
Antes de chegarmos à vitória, falhamos e falhar é parte do processo de design.
1. AirLLM: Tentamos o AirLLM para rodar modelos grandes via Swap. Foi um desastre. A latência do disco transformou a IA em uma máquina de escrever preguiçosa.
2. Aceleração por GPU (Vulkan): Tentamos usar o 1GB da Radeon para acelerar os cálculos. O erro? Modelos modernos de 3B ou 7B parâmetros simplesmente não cabem na memória de vídeo de 2009. A tentativa de compilar com Vulkan resultou em erros de shader e frustração.
3. Phi-2: O modelo da Microsoft é rápido, mas em nosso hardware ele "pirou". Começou a repetir diálogos e alucinar formatos de chat. Foi rápido, mas não era útil.

## Llama-3.2-3B e o artesanato digital
A virada de chave foi entender que não precisávamos de força bruta, mas de equilíbrio. Escolhemos o Llama-3.2-3B. Ele é inteligente o suficiente para entender português e leve o suficiente para morar na nossa RAM limitada.

### Passo 1: Preparando o terreno (dependências)
O Linux precisa de ferramentas para compilar o llama.cpp. Abra o terminal e instale o essencial:
```Bash
sudo apt update
sudo apt install git build-essential cmake libcurl4-openssl-dev -y
```


### Passo 2: Construindo o motor (llama.cpp)
Não vamos baixar um executável pronto, vamos compilar o código especificamente para os nossos Xeons.
```Bash
cd /media/magicoven/storage/  # ou a pasta de sua preferência
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
mkdir build
cd build

# compilando focado em CPU (desativando Vulkan para evitar conflitos)
cmake .. -DGGML_VULKAN=OFF
cmake --build . --config Release -j$(nproc)
```


### Passo 3: Baixando o modelo (a IA propriamente dita)
Escolhemos o Llama-3.2-3B-Instruct da Meta. Ele é o equilíbrio perfeito entre inteligência e leveza.

1. Vá ao Hugging Face.
2. Procure pela versão Q4_K_M (é a quantização ideal, boa precisão sem ocupar muita RAM).
3. Salve o arquivo .gguf na sua pasta de storage.

## Engenharia de memória
Com apenas 4.8GB de RAM, o Mac Pro engasgaria. A solução técnica foi implementar o zRAM, um sistema que compacta dados na RAM antes de jogá-los para o HD lento.

### Configurando o "pulmão virtual"
Edite o arquivo de sistema:
```Bash
sudo nano /usr/bin/init-zram-swapping
```


Cole este script (que otimizamos para prioridade máxima):
```Bash
#!/bin/sh
# calcula a memória (reservando metade da RAM real para compactação)
mem=$(free -b | grep Mem | awk '{print $2}')
zram_size=$((mem / 2))

# inicializa o dispositivo zram0 com prioridade 100
zramctl --find --size $zram_size
mkswap /dev/zram0
swapon -p 100 /dev/zram0
```


Reinicie o serviço: 
```Bash
sudo systemctl restart zram-config.
```

Prioridade 100 força o Linux a usar a zRAM antes do HD swapon -p 100 /dev/zram

```Bash
# Verificando se a hierarquia de memória está correta
swapon --show
```

O resultado deve mostrar o /dev/zram0 com prioridade 100.

## O Comando llama-3b (automação)
Como UX Engineers, odiamos fricção. Não queremos digitar 10 linhas de comando toda vez que precisamos de um insight. Criamos um script que limpa a casa e inicia a IA com prioridade total do sistema.

Criamos um executável em /usr/local/bin/llama-3b.

Crie o arquivo:

```Bash
sudo nano /usr/local/bin/llama-3b
```


Adicione o código abaixo:

```Bash
#!/bin/zsh
echo "faxina: limpando cache e swap..."
sudo sync && echo 3 | sudo tee /proc/sys/vm/drop_caches
sudo swapoff -a && sudo swapon -a

echo "iniciando Llama-3.2-3B com prioridade máxima..."
# Usamos 6 threads: o equilíbrio perfeito para arquiteturas Dual-CPU
sudo nice -n -10 /media/magicoven/storage/llama.cpp/build/bin/llama-cli \
  -m /media/magicoven/storage/Llama-3.2-3B-Instruct-Q4_K_M.gguf \
  --threads 6 \
  --ctx-size 2048 \
  --batch-size 128 \
  --mlock \
  --no-mmap \
  --color on \
  --conversation
```


Dê permissão de execução: 
```Bash 
sudo chmod +x /usr/local/bin/llama-3b
```

## A Realidade pés no chão
No design, a teoria é linda, mas o uso real é o que importa. Testamos nossa configuração em diferentes cenários de estresse. Entender a relação entre threads e o que está aberto no seu navegador (como o chrome) é crucial para não travar sua produtividade.

Abaixo, você pode explorar como o número de threads e o uso do navegador afetam a velocidade de resposta (tokens por segundo) no nosso hardware específico.

{simulador}

## Lições de um Mac Pro em 2026
Fazer algo funcionar onde outros desistiram é a essência do que fazemos na Magic Oven. Não se trata de ter a melhor ferramenta, mas de ser os melhores artesões com a ferramenta que você tem em mãos.

O Llama-3.2-3B rodando em um Mac Pro 2009 nos ensinou que o "impossível" é apenas um problema de design mal resolvido. Hoje, temos uma IA que gera 1.8 t/s mesmo com 11 abas do Chrome abertas, e que chega a 2.5 t/s em modo foco. Não é a velocidade da luz, mas é a velocidade de uma conversa humana. É uma IA que roda no silêncio do nosso estúdio, sem enviar dados para servidores de terceiros.
Para um designer, ter essa ferramenta rodando localmente, sem depender de nuvem e respeitando o hardware que já possuímos, é a forma mais pura de liberdade técnica.


<div style="padding:123.29% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/1184555970?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&amp;autoplay=1&amp;muted=1&amp;loop=1" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" referrerpolicy="strict-origin-when-cross-origin" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Rodamos IA local em um Mac Pro de 2009 OU ressuscitando gigantes"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>



Não precisamos da última Big Tech vendendo sonhos em subscrições mensais. Precisamos de artesanato digital. O hardware de 2009 ainda tem alma, só precisava de um pouco de zRAM e respeito.

### Dicas para quem quer seguir este caminho:
- Esqueça a GPU antiga: Se ela tem menos de 4GB de VRAM, foque em uma CPU com boas threads.
- Use quantização: Modelos GGUF (Q4_K_M) são o equilíbrio perfeito entre inteligência e peso.
- Cuide da RAM: zRAM é obrigatório para máquinas com menos de 8GB.

**Stay hungry, stay foolish and keep coding.**
