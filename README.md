# AuroraDash 🌌

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Status](https://img.shields.io/badge/Status-Experimental-orange)](https://github.com/codev-aryan/AuroraDash)

An atmospheric, high-fidelity endless runner inspired by the calm, meditative feel of Alto's Adventure. AuroraDash is a creative escape for developers—combining smooth canvas-based gameplay, procedural visuals, and a modern frontend stack to encourage a "flow state."

Guide your rubber-duck-powered sleigh through aurora-lit landscapes in this performance-focused, aesthetically-driven experience.

---

## Features

🎮 **Smooth Canvas Gameplay** – Fluid endless-runner mechanics built on HTML5 Canvas  
🌌 **Atmospheric Visuals** – Aurora-inspired procedural aesthetics  
🦆 **Rubber Duck Sleigh** – A unique, whimsical theme  
⚡ **High Performance** – Optimized rendering for smooth 60fps gameplay  
🎧 **Procedural Audio** – Dynamic soundscapes using the Web Audio API  
🧩 **Modular UI** – Clean, accessible components powered by Radix UI  
💻 **Developer Flow State** – Designed as a meditative coding break

---

## Tech Stack

### Frontend
- **React 18** with **TypeScript**
- **HTML5 Canvas** for game rendering
- **Vite** for blazing-fast development and builds
- **Tailwind CSS** for styling
- **Radix UI** for accessible component primitives
- **React Hook Form** for form handling

### Backend
- **Node.js** + **Express**
- **WebSockets** (`ws`) for real-time capabilities
- **Express Sessions** for state management

### Tooling
- **TypeScript** (strict mode)
- **ESBuild** for fast bundling
- **PostCSS** + **Autoprefixer**
- **Cross-Env** for cross-platform scripts
- **TSX** for TypeScript execution

### Audio
- **Web Audio API** for procedural sound generation

---

## Project Structure

```
AuroraDash/
├── client/               # Frontend application
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── GameCanvas.tsx    # Main game rendering component
│   │   │   └── ui/               # Radix UI components
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── index.html
├── server/              # Backend server
│   └── index.ts
├── scripts/             # Build and utility scripts
│   └── build.ts
├── tailwind.config.ts   # Tailwind configuration
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/codev-aryan/AuroraDash.git
   cd AuroraDash
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in your browser**
   ```
   http://localhost:5173
   ```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build optimized production bundle |
| `npm run start` | Run the production server |
| `npm run check` | Run TypeScript type checking |

---

## Inspiration

AuroraDash draws inspiration from **Alto's Adventure**—a game celebrated for its serene atmosphere and elegant simplicity. This project explores how meditative gameplay can serve as a creative outlet for developers, combining technical challenges with visual beauty.

The goal is to create a space where code and calm intersect, offering a brief escape that refreshes rather than drains.

---

## Contributing

Contributions are welcome! Whether you're fixing bugs, adding features, or improving documentation, your input helps make AuroraDash better.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Reporting Issues

Found a bug or have a feature request? [Open an issue](https://github.com/codev-aryan/AuroraDash/issues) and let's discuss it.

---

## License

This project is licensed under the **MIT License**.

---

## Author

Built by [@codev-aryan](https://github.com/codev-aryan)
