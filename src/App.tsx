import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { ThemeProvider } from './providers/theme-provider';
import { ThemeToggle } from './components/ThemeToggle';
import { Button } from '@/components/base/buttons/button';
import { Input, InputBase } from '@/components/base/input/input';
import { PaymentInput } from '@/components/base/input/input-payment';

function App() {
  const [count, setCount] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-primary text-primary transition-colors">
        <div className="container mx-auto p-8">
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          <div>
            <a href="https://vite.dev" target="_blank">
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </div>
          <h1>Vite + React + Untitled UI</h1>

          {/* Demo Section for Untitled UI Buttons */}
          <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-bold">Untitled UI Button Demo</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Primary Buttons</h3>
                <div className="flex flex-wrap gap-2">
                  <Button color="primary" size="sm">
                    Small
                  </Button>
                  <Button color="primary" size="md">
                    Medium
                  </Button>
                  <Button color="primary" size="lg">
                    Large
                  </Button>
                  <Button color="primary" size="xl">
                    Extra Large
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Secondary Buttons</h3>
                <div className="flex flex-wrap gap-2">
                  <Button color="secondary" size="md">
                    Secondary
                  </Button>
                  <Button color="tertiary" size="md">
                    Tertiary
                  </Button>
                  <Button color="link-gray" size="md">
                    Link Gray
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Destructive Buttons</h3>
                <div className="flex flex-wrap gap-2">
                  <Button color="primary-destructive" size="md">
                    Delete
                  </Button>
                  <Button color="secondary-destructive" size="md">
                    Remove
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Interactive Counter</h3>
                <div className="flex items-center gap-4">
                  <Button
                    color="primary"
                    size="lg"
                    onClick={() => setCount((count) => count + 1)}
                  >
                    Count is {count}
                  </Button>
                  <Button
                    color="secondary"
                    size="lg"
                    onClick={() => setCount(0)}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
            
          </div>

          <p className="read-the-docs mt-8">
            Click on the Vite and React logos to learn more
          </p>
          <InputBase size="md" placeholder="Enter text" />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
