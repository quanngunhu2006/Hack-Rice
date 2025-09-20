import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

function Home() {
  return (
    <div className="flex-1">

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Hero Section */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Welcome to HackRice
            </h1>
            <p className="text-xl text-muted-foreground">
              Join us in creating innovative solutions and pushing the boundaries of technology.
            </p>
            <div className="flex gap-4">
              <Button size="lg">Get Started</Button>
              <Button size="lg" variant="outline">Learn More</Button>
            </div>
          </div>

          {/* Featured Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Check out our latest hackathon events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Spring Hackathon 2024</h3>
                <p className="text-sm text-muted-foreground">
                  Join us for an exciting weekend of innovation and collaboration.
                </p>
                <Button variant="secondary" className="w-full">Register Now</Button>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Workshop Series</h3>
                <p className="text-sm text-muted-foreground">
                  Weekly workshops on cutting-edge technologies.
                </p>
                <Button variant="secondary" className="w-full">View Schedule</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default Home
