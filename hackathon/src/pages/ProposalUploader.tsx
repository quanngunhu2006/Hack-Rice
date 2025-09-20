import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

function ProposalUploader() {
  const [text, setText] = useState('')

  const handleUpload = () => {
    console.log('Upload proposal clicked', text)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Proposal Uploader</h1>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your proposal..." />
      <Button onClick={handleUpload}>Upload Proposal</Button>
    </div>
  )
}

export default ProposalUploader


