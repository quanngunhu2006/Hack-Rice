import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

function About() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">About This Project</CardTitle>
          <CardDescription>
            Learn more about our modern React application
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Technology Stack</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted p-3 rounded-lg">
                  <h4 className="font-medium">Frontend</h4>
                  <p className="text-sm text-muted-foreground">React 19 + TypeScript</p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <h4 className="font-medium">Build Tool</h4>
                  <p className="text-sm text-muted-foreground">Vite</p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <h4 className="font-medium">Styling</h4>
                  <p className="text-sm text-muted-foreground">Tailwind CSS</p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <h4 className="font-medium">UI Components</h4>
                  <p className="text-sm text-muted-foreground">shadcn/ui</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Features</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Modern React with hooks and functional components</li>
                <li>TypeScript for type safety</li>
                <li>Fast development with Vite</li>
                <li>Beautiful UI with shadcn/ui components</li>
                <li>Responsive design with Tailwind CSS</li>
                <li>Client-side routing with React Router</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default About
