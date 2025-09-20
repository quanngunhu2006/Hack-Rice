import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function About() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Headline and Sub-headline */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Powering the Voice of Our Communities</h1>
        <p className="text-xl text-muted-foreground">
          We believe the best solutions for our neighborhoods come from the people who live there. [Your Platform Name] turns your ideas into action.
        </p>
      </div>

      {/* The Gap Between a Good Idea and a Real Change */}
      <Card>
        <CardHeader>
          <CardTitle>The Gap Between a Good Idea and a Real Change</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Ever walked down your street and thought, "You know, a crosswalk here would make things so much safer," or "This empty lot would be a perfect spot for a community garden"? You're not alone. Our cities are filled with passionate residents who have brilliant, practical ideas for improving their own backyards.
          </p>
          <p>
            But for too long, the path to making those ideas a reality has been blocked. Confusing paperwork, endless phone calls, city hall meetings at inconvenient times, and the overwhelming feeling that one person can't possibly make a difference have stood in the way. Individual voices, no matter how passionate, often get lost in the noise. The result? Great ideas fade, problems persist, and residents become disconnected from the decisions that shape their daily lives.
          </p>
        </CardContent>
      </Card>

      {/* Our Solution: From Conversation to Concrete Action */}
      <Card>
        <CardHeader>
          <CardTitle>Our Solution: From Conversation to Concrete Action</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            [Your Platform Name] is a revolutionary civic engagement platform designed to bridge that gap. We amplify your voice by providing the tools for you and your neighbors to collectively identify, support, and propose meaningful improvements for your community.
          </p>
          <p>
            Our platform isn't just a forum for discussion; it's a launchpad for action. When an idea gains enough support from the community, we do the heavy lifting—transforming your collective will into a formal, professional report. This report, backed by the digital signatures of every upvoter, is delivered directly to the people in power at your local city council. We handle the bureaucracy so you can focus on the ideas.
          </p>
        </CardContent>
      </Card>

      {/* Our Mission and Vision */}
      <Card>
        <CardHeader>
          <CardTitle>Our Mission and Vision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-semibold">Our Mission</h3>
          <p>
            To democratize civic engagement by removing the barriers between residents and their local government. We provide a simple, transparent, and effective platform to ensure community needs are heard, validated, and acted upon.
          </p>
          <h3 className="text-lg font-semibold">Our Vision</h3>
          <p>
            We envision a future where cities are co-created by their residents. A future where every neighborhood is a direct reflection of the people who call it home, and where local government is a responsive and accessible partner in building safer, greener, and more vibrant communities for everyone.
          </p>
        </CardContent>
      </Card>

      {/* How It Works: Your Four Steps to Impact */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works: Your Four Steps to Impact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2">
            <li>
              <strong>Share Your Vision:</strong> Have an idea? Pin it directly onto our interactive map of your city. Add a title, a short description, and a category. Whether it's a request to fix a pothole, a proposal for a new public art installation, or a plan for a neighborhood block party, no idea is too small or too big.
            </li>
            <li>
              <strong>Build Momentum:</strong> Once your proposal is live, your neighbors can view, discuss, and support it with an upvote. This is the heart of our platform. Watch as your neighbors rally behind your proposal, adding their voices to yours. Every upvote is a voice saying, "I want this too!" and it also serves as a pledge to digitally sign the final report if the goal is met.
            </li>
            <li>
              <strong>Trigger Official Action:</strong> Once a proposal reaches a critical mass of support—our designated upvote threshold—our system automatically prepares it for the next step. This threshold ensures that the reports sent to the city council represent a significant and verified community interest, making them impossible to ignore.
            </li>
            <li>
              <strong>We Handle the Bureaucracy:</strong> Our system automatically compiles the proposal details, supportive comments, and the list of digital signatures from upvoters into a professional report. We format it to meet official standards and submit it directly to the appropriate city department or council member through their designated channels. We then provide you with tracking tools to follow its progress.
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Our Guiding Principles */}
      <Card>
        <CardHeader>
          <CardTitle>Our Guiding Principles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Empowerment:</strong> We believe in the power of the individual, multiplied by the community. We provide the tools; you provide the vision.
            </li>
            <li>
              <strong>Transparency:</strong> The civic process should not be a black box. From proposal status to city responses, we are committed to an open process where everyone is kept informed.
            </li>
            <li>
              <strong>Accessibility:</strong> Civic engagement should be for everyone, not just for those who have the time and resources to navigate complex systems. Our platform is designed to be simple, intuitive, and available to all.
            </li>
            <li>
              <strong>Collaboration:</strong> We are a bridge, not just a megaphone. We aim to foster constructive dialogue between residents, neighbors, and city officials to achieve the best possible outcomes.
            </li>
            <li>
              <strong>Impact:</strong> Our success is measured by real-world change—safer streets, better parks, improved services, and a more responsive local government.
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Ready to Shape Your City?</h2>
        <p>Your community is waiting to hear from you. Your ideas matter. Your voice has power. Let's build a better city, together.</p>
        <Button size="lg" variant="default">Get Started</Button>
      </div>
    </div>
  )
}

export default About
