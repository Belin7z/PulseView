# Hello World 🚀

Um site interativo e moderno que exibe a hora atual com um efeito parallax 3D dinâmico.

## 📋 Descrição

Este é um projeto simples mas elegante que demonstra a combinação de **HTML**, **CSS** e **JavaScript** para criar uma experiência visual atraente. A página exibe "Hello World" e um relógio em tempo real que responde ao movimento do mouse com um efeito parallax 3D suave e fluido.

## ✨ Características

✅ **Efeito Parallax 3D Dinâmico** - O relógio rotaciona e amplia suavemente ao passar o mouse, criando uma sensação de profundidade

✅ **Atualização de Hora em Tempo Real** - O relógio atualiza a cada segundo, exibindo a hora no formato HH:MM:SS

✅ **Design Glassmorphism** - Interface moderna com efeito de vidro fosco e desfoque de fundo

✅ **Gradiente Vibrante** - Fundo com gradiente de cores que transiciona de azul para roxo

✅ **Animação de Entrada** - O título tem uma animação suave ao carregar a página

✅ **Responsivo** - Funciona perfeitamente em dispositivos de diferentes tamanhos

✅ **Sem Seleção de Texto** - Experiência de usuário aprimorada ao interagir com o elemento

## 🎯 Objetivo

Este projeto foi criado como um **exercício prático** para:
- Aprender e praticar **HTML, CSS e JavaScript**
- Entender conceitos de **centralização com Flexbox**
- Dominar **transformações 3D e perspectiva** CSS
- Implementar **animações fluidas** com `requestAnimationFrame()`
- Trabalhar com **Git e GitHub**

## 🚀 Como Usar

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Belin7z/hello-world.git
   cd hello-world
   ```

2. **Abra o arquivo `index.html` no seu navegador**

3. **Interaja com o relógio:**
   - Passe o mouse sobre o relógio para ver o efeito parallax 3D
   - Observe a hora atualizar em tempo real
   - Mova o mouse em diferentes posições para explorar diferentes ângulos de rotação

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura semântica da página
- **CSS3** - Estilos avançados com:
  - Gradientes lineares
  - Transformações 3D e perspectiva
  - Animações keyframes
  - Backdrop-filter (glassmorphism)
  - Transições suaves
  
- **JavaScript (Vanilla)** - Lógica interativa com:
  - `requestAnimationFrame()` para animações fluidas
  - Event listeners para mousemove e mouseleave
  - Cálculos dinâmicos de rotação baseados na posição do mouse
  - Interpolação suave para transições naturais

## 📊 Como Funciona

### Efeito Parallax 3D

1. **Captura de Movimento**: Quando o mouse se move sobre o relógio, o evento `mousemove` é capturado
2. **Cálculo de Rotação**: A posição do mouse é calculada em relação ao centro do elemento
3. **Animação Suave**: Usando `requestAnimationFrame()`, as rotações são suavemente interpoladas para uma animação fluida
4. **Perspectiva 3D**: CSS `perspective` e `rotateX`/`rotateY` criam o efeito 3D
5. **Reset**: Quando o mouse sai, o elemento volta suavemente à posição original

### Atualização de Hora

A função `atualizarHora()` executa a cada 1000ms (1 segundo), capturando a hora atual e atualizando o elemento no DOM.

## 📁 Estrutura do Projeto

```
hello-world/
├── index.html      # Página principal
├── README.md       # Este arquivo
└── .gitignore      # Arquivos ignorados pelo Git
```

## 🎨 Customizações

Você pode personalizar o projeto editando:

- **Cores**: Altere os valores hexadecimais no gradiente de fundo
- **Velocidade da Animação**: Modifique o valor `0.1` na função `animateTransform()` para mais/menos fluidez
- **Ângulo de Rotação**: Ajuste o valor `25` para aumentar/diminuir a intensidade do efeito 3D
- **Fonte**: Substitua `'Arial'` por outra fonte de sua preferência

## 🌐 Demo Online

Você pode acessar a versão ao vivo em:
**[https://belin7z.github.io/hello-world/](https://belin7z.github.io/hello-world/)**

## 📝 Autor

**Belin** (@Belin7z)

## 📅 Data de Início

26 de dezembro de 2025

## 📄 Licença

Este projeto é de código aberto e pode ser usado livremente para fins educacionais.

---

**Desenvolvido com ❤️ para aprender e praticar desenvolvimento web**
