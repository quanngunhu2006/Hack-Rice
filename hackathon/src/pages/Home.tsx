import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

function Home() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Vite + React + shadcn/ui</CardTitle>
          <CardDescription>
            A modern React application with shadcn/ui components
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4">
          <Button
            onClick={() => setCount((count) => count + 1)}
            size="lg"
          >
            Count is {count}
          </Button>
          <p className="text-muted-foreground text-center">
            Edit <code className="bg-muted px-1 py-0.5 rounded text-sm">src/App.tsx</code> and save to test HMR
          </p>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2 justify-center">
          <Button variant="outline" size="sm" asChild>
            <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
              Vite Docs
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
              React Docs
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="https://ui.shadcn.com" target="_blank" rel="noopener noreferrer">
              shadcn/ui
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Home
