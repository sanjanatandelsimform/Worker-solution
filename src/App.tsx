import React, { useState } from 'react';
import Header from './components/Header/Header';
import Card from './components/Card/Card';
import Button from './components/Button/Button';
import './App.css';

const NAV_ITEMS = [
  { label: 'Home', href: '#' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

const CARDS = [
  {
    id: 1,
    title: 'Global Copilot Rules',
    description:
      'The .github/copilot-instructions.md file defines 5 global rules: TypeScript strict mode, naming conventions, error handling, no direct DOM manipulation, and security best practices.',
  },
  {
    id: 2,
    title: 'Scoped Frontend Rules',
    description:
      'The .github/instructions/frontend.instructions.md targets src/components/**/*.tsx with React-specific rules: functional components, hook patterns, CSS Modules, accessibility, and performance.',
  },
  {
    id: 3,
    title: 'Instruction Verification',
    description:
      'These components follow the scoped frontend rules: explicit prop interfaces, CSS Modules, semantic HTML, aria-labels, and no class components. Global rules apply codebase-wide.',
  },
];

const App: React.FC = () => {
  const [clickedId, setClickedId] = useState<number | null>(null);

  const handleCardAction = (id: number): void => {
    setClickedId(id);
  };

  const handleReset = (): void => {
    setClickedId(null);
  };

  return (
    <div className="app">
      <Header appName="Copilot Demo" navItems={NAV_ITEMS} />
      <main className="main">
        <section className="hero-section" aria-labelledby="hero-title">
          <h1 id="hero-title">GitHub Copilot Instructions Demo</h1>
          <p className="subtitle">
            A React + TypeScript app demonstrating global and scoped Copilot instruction files.
          </p>
          {clickedId !== null && (
            <div className="status" role="status" aria-live="polite">
              Card #{clickedId} action triggered!{' '}
              <Button label="Reset" onClick={handleReset} variant="secondary" />
            </div>
          )}
        </section>

        <section className="cards" aria-label="Feature cards">
          {CARDS.map((card) => (
            <Card
              key={card.id}
              title={card.title}
              description={card.description}
              actionLabel="Learn More"
              onAction={() => handleCardAction(card.id)}
            />
          ))}
        </section>

        <section className="demo-buttons" aria-label="Button variants demo">
          <h2>Button Variants</h2>
          <div className="button-row">
            <Button label="Primary Button" onClick={() => alert('Primary clicked!')} />
            <Button
              label="Secondary Button"
              onClick={() => alert('Secondary clicked!')}
              variant="secondary"
            />
            <Button label="Disabled Button" onClick={() => {}} disabled />
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>Built with React + TypeScript + Vite &mdash; following GitHub Copilot instruction rules.</p>
      </footer>
    </div>
  )
}

export default App
