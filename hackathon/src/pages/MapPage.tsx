import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/useToast'
import { useAuth0 } from '@auth0/auth0-react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import { Icon } from 'leaflet'
import { Plus, MapPin, Calendar, Layers, Info } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Create modern custom pin icons
const createCustomPin = (color: string, size: number = 32) => {
  const svgIcon = `
    <svg width="${size}" height="${size + 8}" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="1" stop-opacity="0.1"/>
        </filter>
      </defs>
      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2Z" 
            fill="${color}" stroke="white" stroke-width="2" filter="url(#shadow)"
            style="transition: all 0.2s ease-in-out"/>
      <circle cx="12" cy="9" r="3" fill="white"/>
    </svg>
  `
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon)}`,
    iconSize: [size, size + 8],
    iconAnchor: [size/2, size],
    popupAnchor: [0, -size + 4]
  })
}

// Different pin colors for different types
const reportPin = createCustomPin('#ef4444', 32) // Red for reports
const selectedPin = createCustomPin('#3b82f6', 36) // Blue for selected location

// Create a delicate, orangey heatmap visualization
const createHeatmapIcon = (intensity: number) => {
  const size = 18 + (intensity * 12) // Slightly smaller size varies with intensity
  const opacity = 0.2 + (intensity * 0.3) // More subtle opacity range
  const svgIcon = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="grad${intensity}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#ff8c42;stop-opacity:${opacity + 0.25}" />
          <stop offset="60%" style="stop-color:#ffa65c;stop-opacity:${opacity + 0.1}" />
          <stop offset="100%" style="stop-color:#ffb366;stop-opacity:0.05" />
        </radialGradient>
      </defs>
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="url(#grad${intensity})" />
      <circle cx="${size/2}" cy="${size/2}" r="${size/5}" fill="#ff8c42" opacity="${opacity + 0.2}" />
    </svg>
  `
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon)}`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, 0]
  })
}

// Houston center coordinates
const HOUSTON_CENTER = [29.7604, -95.3698] as [number, number]

// Demo heatmap data points
const DEMO_HEATMAP_DATA = [
  { lat: 29.7604, lng: -95.3698, intensity: 0.8 }, // Downtown
  { lat: 29.7749, lng: -95.4194, intensity: 0.6 }, // Richmond/Gessner
  { lat: 29.7340, lng: -95.3890, intensity: 0.7 }, // Westheimer
  { lat: 29.8016, lng: -95.3445, intensity: 0.5 }, // North Shepherd
  { lat: 29.7372, lng: -95.3963, intensity: 0.9 }, // Bissonnet
  { lat: 29.7792, lng: -95.3518, intensity: 0.4 }, // Washington Ave
  { lat: 29.7589, lng: -95.3876, intensity: 0.6 }, // Louisiana St
  { lat: 29.7654, lng: -95.3712, intensity: 0.8 }, // McKinney St
  { lat: 29.7445, lng: -95.4010, intensity: 0.5 }, // Southwest Freeway
  { lat: 29.7890, lng: -95.3290, intensity: 0.7 }, // Heights area
]

// Demo road reports data
const DEMO_ROAD_REPORTS = [
  {
    id: '1',
    lat: 29.7604,
    lng: -95.3698,
    description: 'Large pothole causing traffic to swerve',
    street_name: 'Main Street',
    created_at: new Date().toISOString(),
    media_urls: []
  },
  {
    id: '2', 
    lat: 29.7749,
    lng: -95.4194,
    description: 'Flooding occurs during heavy rain',
    street_name: 'Richmond Avenue',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    media_urls: []
  },
  {
    id: '3',
    lat: 29.7340,
    lng: -95.3890,
    description: 'Broken water main created sinkhole',
    street_name: 'Westheimer Road',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    media_urls: []
  },
  {
    id: '4',
    lat: 29.8016,
    lng: -95.3445,
    description: 'Road surface deteriorating rapidly',
    street_name: 'North Shepherd Drive',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    media_urls: []
  },
  {
    id: '5',
    lat: 29.7372,
    lng: -95.3963,
    description: 'Standing water that does not drain',
    street_name: 'Bissonnet Street',
    created_at: new Date(Date.now() - 345600000).toISOString(),
    media_urls: []
  }
]

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
    <Marker 
      position={position} 
      icon={selectedPin}
    >
      <Popup>
        <div className="text-center">
          <div className="flex items-center gap-2 text-blue-600">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">Selected Location</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Fill out the form to report an issue here
          </p>
        </div>
      </Popup>
    </Marker>
  )
}

// Report Detail Modal Component
interface Report {
  id: string;
  lat: number;
  lng: number;
  description: string;
  street_name?: string;
  created_at: string;
  media_urls: string[];
}

function ReportDetailModal({ 
  report, 
  isOpen, 
  onClose 
}: { 
  report: Report | null; 
  isOpen: boolean; 
  onClose: () => void 
}) {
  if (!report) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white border-2 shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-500" />
            Road Report Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Description</Label>
            <p className="text-sm mt-1">{report.description}</p>
          </div>
          
          {report.street_name && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Location</Label>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span className="text-sm">{report.street_name}</span>
              </div>
            </div>
          )}
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Reported</Label>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{new Date(report.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          {report.media_urls && report.media_urls.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Media</Label>
              <div className="mt-2 space-y-2">
                <Badge variant="secondary" className="text-xs">
                  {report.media_urls.length} photo(s) attached
                </Badge>
                <div className="grid grid-cols-2 gap-2">
                  {report.media_urls.map((url, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={url} 
                        alt={`Report image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function MapPage() {
  const [showAddReport, setShowAddReport] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)
  const [reportForm, setReportForm] = useState({
    street_name: '',
    description: '',
    media_files: [] as File[]
  })
  const [showReports, setShowReports] = useState(true)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [roadReports, setRoadReports] = useState(DEMO_ROAD_REPORTS)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)

  const { isAuthenticated } = useAuth0()
  const { toast } = useToast()

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation([lat, lng])
  }

  const handleReportClick = (report: Report) => {
    setSelectedReport(report)
    setShowReportModal(true)
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

    // Demo implementation - just show success
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


            {/* Add report button */}
            {isAuthenticated && (
              <Dialog open={showAddReport} onOpenChange={setShowAddReport}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-white border-2 shadow-xl">
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
                        disabled={!selectedLocation || !reportForm.description.trim()}
                        className="flex-1"
                      >
                        Submit Report
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
          {showReports && roadReports.map((report) => (
            <Marker 
              key={report.id} 
              position={[report.lat, report.lng]} 
              icon={reportPin}
              eventHandlers={{
                click: () => handleReportClick(report)
              }}
            >
              {!showReportModal && (
                <Popup>
                  <div className="space-y-3 min-w-[200px]">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-sm">{report.description}</p>
                        {report.street_name && (
                          <div className="flex items-center gap-1 text-sm text-blue-600 mt-1">
                            <MapPin className="h-3 w-3" />
                            {report.street_name}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground border-t pt-2">
                      <Calendar className="h-3 w-3" />
                      {new Date(report.created_at).toLocaleDateString()}
                    </div>
                    
                    <div className="text-xs text-blue-600 border-t pt-2 cursor-pointer hover:text-blue-800">
                      <div className="flex items-center gap-1" onClick={() => handleReportClick(report)}>
                        <Info className="h-3 w-3" />
                        Click for more details
                      </div>
                    </div>
                  </div>
                </Popup>
              )}
            </Marker>
          ))}

          {/* Heatmap visualization */}
          {showHeatmap && DEMO_HEATMAP_DATA.map((point, index) => (
            <Marker
              key={`heatmap-${index}`}
              position={[point.lat, point.lng]}
              icon={createHeatmapIcon(point.intensity)}
            >
              <Popup>
                <div className="space-y-2 text-center min-w-[150px]">
                  <div className="flex items-center gap-2 justify-center">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ 
                        backgroundColor: '#ff8c42', 
                        opacity: 0.3 + (point.intensity * 0.4) 
                      }}
                    ></div>
                    <span className="text-sm font-medium">Activity Hotspot</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Report Density: <span className="font-medium text-red-600">
                        {Math.round(point.intensity * 100)}%
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This area has higher concentrations of road issues
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Houston boundary overlay would go here */}
        {/* TODO: Add Houston polygon overlay to gray out outside areas */}
      </div>

      {/* Status bar */}
      {!showReportModal && (
        <div className="p-2 border-t bg-muted/50 text-xs text-muted-foreground">
          <div className="flex justify-between items-center">
            <span>
              {roadReports.length} reports loaded
              {showHeatmap && ` • ${DEMO_HEATMAP_DATA.length} heatmap points`}
            </span>
            <span>
              Click "Add Report" then click map to place pin • Reports must be inside Houston city limits
            </span>
          </div>
        </div>
      )}

      {/* Report Detail Modal */}
      <ReportDetailModal 
        report={selectedReport}
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false)
          setSelectedReport(null)
        }}
      />
    </div>
  )
}
