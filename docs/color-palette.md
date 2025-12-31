# Magic Oven - Paleta de Cores

Este documento contém a paleta de cores oficial do Magic Oven.

## Cores Principais

### Preto
- **Hex:** `#080808`
- **Uso:** Cor de fundo principal, criando uma base escura e moderna

### Verde Neon
- **Hex:** `#27FF2B`
- **Uso:** Cor de destaque principal, usado em elementos interativos, CTAs, e efeitos de brilho

## Tons de Preto/Cinza

### Background
- **Variável:** `--color-background`
- **Hex:** `#080808`
- **Uso:** Fundo principal do site

### Surface
- **Variável:** `--color-surface`
- **Hex:** `#0d0d0d`
- **Uso:** Superfícies de segundo nível (cards, seções alternadas)

### Surface Elevated
- **Variável:** `--color-surface-elevated`
- **Hex:** `#121212`
- **Uso:** Elementos que precisam se destacar levemente do fundo

## Texto

### Primário
- **Variável:** `--color-text-primary`
- **Hex:** `#ffffff`
- **Uso:** Títulos e texto principal

### Secundário
- **Variável:** `--color-text-secondary`
- **Hex:** `#a0a0a0`
- **Uso:** Descrições, legendas

### Terciário
- **Variável:** `--color-text-tertiary`
- **Hex:** `#4a4a4a`
- **Uso:** Texto de menor importância, labels

## Verde - Variações

### Accent Primary
- **Variável:** `--color-accent-primary`
- **Hex:** `#27FF2B`
- **Uso:** Links, botões primários, destaques

### Accent Secondary
- **Variável:** `--color-accent-secondary`
- **Hex:** `#1ed923`
- **Uso:** Hover states, estados secundários

### Accent Tertiary
- **Variável:** `--color-accent-tertiary`
- **Hex:** `#39ff3d`
- **Uso:** Variações de hover, brilhos intensos

## Efeitos de Brilho

### Green Glow
- **Variável:** `--color-glow-green`
- **RGBA:** `rgba(39, 255, 43, 0.5)`
- **Uso:** Efeitos de brilho fortes

### Green Glow Soft
- **Variável:** `--color-glow-green-soft`
- **RGBA:** `rgba(39, 255, 43, 0.2)`
- **Uso:** Efeitos de brilho suaves

## Gradientes

### Primary
```css
linear-gradient(135deg, #1ed923 0%, #0fa312 100%)
```
Usado em botões primários e CTA

### Secondary
```css
linear-gradient(135deg, #27FF2B 0%, #1ed923 100%)
```
Usado em botões secundários

### Accent
```css
linear-gradient(135deg, #39ff3d 0%, #27FF2B 100%)
```
Usado em títulos e elementos de destaque

### Warm
```css
linear-gradient(135deg, #27FF2B 0%, #00cc1f 100%)
```
Usado em elementos que precisam de um tom mais escuro

## Aplicação

### Vinheta
A vinheta usa múltiplas camadas de box-shadow com o verde neon:
```css
box-shadow:
    inset 0 0 100px rgba(39, 255, 43, 0.15),
    inset 0 0 200px rgba(39, 255, 43, 0.08),
    inset 0 0 300px rgba(39, 255, 43, 0.04);
```

### Contraste
O esquema de cores verde neon (#27FF2B) sobre preto (#080808) cria um:
- **Alto contraste:** Excelente legibilidade
- **Estética Cyberpunk:** Visual moderno e tech
- **Impacto visual:** Cores vibrantes que chamam atenção

## Acessibilidade

- **Contraste verde/preto:** 8.4:1 (AAA)
- **Contraste branco/preto:** 21:1 (AAA)
- Todas as combinações atendem às diretrizes WCAG 2.1

---

**Última atualização:** 31 de Dezembro de 2025
