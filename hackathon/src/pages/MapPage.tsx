import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/useToast'
import { useRoadReports, useCreateRoadReport } from '@/hooks/useRoadReports'
import { useAuth } from '@/contexts/AuthContext'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import { Icon } from 'leaflet'
import { Plus, MapPin, Calendar, Filter, Layers } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Houston center coordinates
const HOUSTON_CENTER = [29.7604, -95.3698] as [number, number]

function AddReportMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null)

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      // TODO: Add Houston boundary check here
      setPosition([lat, lng])
      onLocationSelect(lat, lng)
    },
  })

  return position === null ? null : (
    <Marker position={position} icon={defaultIcon}>
      <Popup>Report location selected</Popup>
    </Marker>
  )
}

export default function MapPage() {
  const [showAddReport, setShowAddReport] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)
  const [reportForm, setReportForm] = useState({
    street_name: '',
    description: '',
    media_files: [] as File[]
  })
  const [showReports, setShowReports] = useState(true)
  const [showHeatmap, setShowHeatmap] = useState(false)

  const { user, profile } = useAuth()
  const { toast } = useToast()
  
  const { data: roadReports, isLoading } = useRoadReports({
    // TODO: Add bbox based on map bounds
  })
  
  const createReport = useCreateRoadReport()

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation([lat, lng])
  }

  const handleSubmitReport = async () => {
    if (!selectedLocation) {
      toast({
        title: "Location required",
        description: "Please click on the map to select a location",
        variant: "destructive"
      })
      return
    }

    if (!reportForm.description.trim()) {
      toast({
        title: "Description required",
        description: "Please provide a description of the issue",
        variant: "destructive"
      })
      return
    }

    try {
      await createReport.mutateAsync({
        lat: selectedLocation[0],
        lng: selectedLocation[1],
        street_name: reportForm.street_name,
        description: reportForm.description,
        media_files: reportForm.media_files
      })

      toast({
        title: "Report submitted",
        description: "Your road report has been submitted successfully",
      })

      // Reset form
      setReportForm({
        street_name: '',
        description: '',
        media_files: []
      })
      setSelectedLocation(null)
      setShowAddReport(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive"
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setReportForm({ ...reportForm, media_files: files })
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Road Reports Map</h1>
            <p className="text-muted-foreground">View and report road issues in Houston</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Toggle buttons */}
            <Button
              variant={showReports ? "default" : "outline"}
              size="sm"
              onClick={() => setShowReports(!showReports)}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Reports
            </Button>
            
            <Button
              variant={showHeatmap ? "default" : "outline"}
              size="sm"
              onClick={() => setShowHeatmap(!showHeatmap)}
            >
              <Layers className="mr-2 h-4 w-4" />
              Heatmap
            </Button>

            {/* Sidebar toggle */}
            <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters & Recent Reports</SheetTitle>
                </SheetHeader>
                
                <div className="space-y-4 mt-6">
                  <div>
                    <Label>Date Range</Label>
                    <p className="text-sm text-muted-foreground">Date filtering coming soon</p>
                  </div>
                  
                  <div>
                    <Label>Recent Reports</Label>
                    <div className="space-y-2 mt-2">
                      {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <Card key={i}>
                            <CardContent className="p-3">
                              <Skeleton className="h-4 w-full mb-2" />
                              <Skeleton className="h-3 w-3/4" />
                            </CardContent>
                          </Card>
                        ))
                      ) : roadReports && roadReports.length > 0 ? (
                        roadReports.slice(0, 5).map((report) => (
                          <Card key={report.id} className="cursor-pointer hover:bg-muted/50">
                            <CardContent className="p-3">
                              <p className="text-sm font-medium">{report.description}</p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(report.created_at).toLocaleDateString()}
                                {report.street_name && (
                                  <>
                                    <MapPin className="h-3 w-3" />
                                    {report.street_name}
                                  </>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No reports found</p>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Add report button */}
            {user && profile?.verified_resident && (
              <Dialog open={showAddReport} onOpenChange={setShowAddReport}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Report Road Issue</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {selectedLocation 
                        ? "Location selected on map" 
                        : "Click on the map to select a location"
                      }
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="street_name">Street Name (Optional)</Label>
                      <Input
                        id="street_name"
                        placeholder="Main Street, 5th Avenue, etc."
                        value={reportForm.street_name}
                        onChange={(e) => setReportForm({ ...reportForm, street_name: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the road issue (potholes, flooding, etc.)"
                        value={reportForm.description}
                        onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="media">Photos (Optional)</Label>
                      <Input
                        id="media"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                      />
                      {reportForm.media_files.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {reportForm.media_files.length} file(s) selected
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSubmitReport}
                        disabled={!selectedLocation || !reportForm.description.trim() || createReport.isPending}
                        className="flex-1"
                      >
                        {createReport.isPending ? "Submitting..." : "Submit Report"}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAddReport(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={HOUSTON_CENTER}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Add report mode */}
          {showAddReport && (
            <AddReportMarker onLocationSelect={handleLocationSelect} />
          )}
          
          {/* Existing reports */}
          {showReports && roadReports?.map((report) => (
            <Marker 
              key={report.id} 
              position={[report.lat, report.lng]} 
              icon={defaultIcon}
            >
              <Popup>
                <div className="space-y-2">
                  <p className="font-medium">{report.description}</p>
                  {report.street_name && (
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3" />
                      {report.street_name}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(report.created_at).toLocaleDateString()}
                  </div>
                  {report.media_urls && report.media_urls.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {report.media_urls.length} photo(s)
                    </Badge>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Houston boundary overlay would go here */}
        {/* TODO: Add Houston polygon overlay to gray out outside areas */}
      </div>

      {/* Status bar */}
      <div className="p-2 border-t bg-muted/50 text-xs text-muted-foreground">
        <div className="flex justify-between items-center">
          <span>
            {roadReports ? `${roadReports.length} reports loaded` : 'Loading reports...'}
          </span>
          <span>
            Click map to add report • Reports must be inside Houston city limits
          </span>
        </div>
      </div>
    </div>
  )
}
