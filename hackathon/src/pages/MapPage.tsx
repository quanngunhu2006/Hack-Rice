import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/useToast'
import { useAuth0 } from '@auth0/auth0-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import { Plus, MapPin, Calendar, Layers, Info, Trash2, Loader2 } from 'lucide-react'
import { RoadReportsAPI } from '@/lib/roadReports-final'
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



// Report Detail Modal Component
interface Report {
  id: number;
  lat: number;
  lng: number;
  description: string;
  street_name: string;
  created_at: string;
  media_urls: string[];
  author_id: string;
}

function ReportDetailModal({ 
  report, 
  isOpen, 
  onClose,
  onDelete,
  currentUserId
}: { 
  report: Report | null; 
  isOpen: boolean; 
  onClose: () => void;
  onDelete?: (reportId: number) => void;
  currentUserId?: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!report) return null

  // Check if current user can delete this report
  const canDelete = currentUserId && report.author_id === currentUserId

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!onDelete) return
    
    setIsDeleting(true)
    try {
      await onDelete(report.id)
      setShowDeleteConfirm(false)
      onClose() // Close the modal after successful deletion
    } catch (error) {
      console.error('Failed to delete report:', error)
      // Error handling will be done in the parent component
    } finally {
      setIsDeleting(false)
    }
  }

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
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Location</Label>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span className="text-sm">{report.street_name}</span>
            </div>
          </div>
          
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
          
          <div className="flex justify-between pt-4 border-t">
            {canDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteClick}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Report
                  </>
                )}
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-white border-2 shadow-xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Report?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this report? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}

export default function MapPage() {
  const [showAddReport, setShowAddReport] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)
  const [reportForm, setReportForm] = useState({
    address: '',
    description: '',
    media_files: [] as File[]
  })
  const [showReports, setShowReports] = useState(true)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [roadReports, setRoadReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)

  const { isAuthenticated, user } = useAuth0()
  const { toast } = useToast()


  const handleReportClick = (report: Report) => {
    setSelectedReport(report)
    setShowReportModal(true)
  }

  const handleDeleteReport = async (reportId: number) => {
    if (!user?.sub) {
      toast({
        title: "Error",
        description: "You must be logged in to delete reports",
        variant: "destructive"
      })
      return
    }

    try {
      await RoadReportsAPI.deleteReport(reportId, user.sub)
      
      // Remove from local state
      setRoadReports(prev => prev.filter(report => report.id !== reportId))
      
      toast({
        title: "Success",
        description: "Report deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting report:', error)
      toast({
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to delete report",
        variant: "destructive"
      })
    }
  }

  // Geocoding function to convert address to coordinates
  const geocodeAddress = async (address: string): Promise<{lat: number, lng: number} | null> => {
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Houston, TX')}&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        }
      }
      return null
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    }
  }

  // Handle address geocoding
  const handleAddressGeocode = async () => {
    if (!reportForm.address.trim()) {
      toast({
        title: "Address required",
        description: "Please enter an address to geocode",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Geocoding address...",
      description: "Finding coordinates for the address",
    })

    const coords = await geocodeAddress(reportForm.address)
    
    if (coords) {
      setSelectedLocation([coords.lat, coords.lng])
      toast({
        title: "Location found!",
        description: `Coordinates: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
      })
    } else {
      toast({
        title: "Address not found",
        description: "Could not find coordinates for this address. Please try a different address.",
        variant: "destructive"
      })
    }
  }

  const handleSubmitReport = async () => {
    // Validation
    if (!reportForm.address.trim()) {
      toast({
        title: "Address required",
        description: "Please enter an address",
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

    if (!selectedLocation) {
      toast({
        title: "Location required",
        description: "Please geocode an address to find the location",
        variant: "destructive"
      })
      return
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to submit reports",
        variant: "destructive"
      })
      return
    }

    try {
      // Create report in Supabase with Auth0 user data
      const newReport = await RoadReportsAPI.createReport({
        address: reportForm.address.trim(),
        description: reportForm.description.trim(),
        media_files: reportForm.media_files,
        coordinates: {
          lat: selectedLocation[0],
          lng: selectedLocation[1]
        }
      }, {
        sub: user.sub!,
        given_name: user.given_name,
        family_name: user.family_name,
        email: user.email,
        name: user.name
      })

      // Convert Supabase report to our local format
      const localReport: Report = {
        id: newReport.id,
        lat: selectedLocation[0],
        lng: selectedLocation[1],
        description: newReport.description,
        street_name: newReport.street_name || reportForm.address.trim(),
        created_at: newReport.created_at,
        media_urls: newReport.media_urls || [],
        author_id: user.sub || ''
      }
  

      // Add to local state for immediate UI update
      setRoadReports(prevReports => [...prevReports, localReport])

      // Get user's display name for success message
      const userName = RoadReportsAPI.getUserDisplayName({
        given_name: user.given_name,
        family_name: user.family_name,
        name: user.name
      })

      // Success message
      toast({
        title: "Report submitted successfully!",
        description: `Thank you ${userName}! Report #${newReport.id} has been added to the map`,
      })

      // Reset form
      setReportForm({
        address: '',
        description: '',
        media_files: []
      })
      setSelectedLocation(null)
      setShowAddReport(false)

    } catch (error) {
      console.error('Error submitting report:', error)
      toast({
        title: "Error submitting report",
        description: error instanceof Error ? error.message : "There was an error submitting your report. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setReportForm({ ...reportForm, media_files: files })
  }

  // Load reports from Supabase
  const loadReportsFromSupabase = async () => {
    try {
      // Test connection first
      const isConnected = await RoadReportsAPI.testConnection()
      if (!isConnected) {
        throw new Error('Cannot connect to database')
      }

      const reports = await RoadReportsAPI.getAllReports()
      const localReports: Report[] = reports.map(report => ({
        id: report.id, // Now a number (int4)
        lat: report.lat,
        lng: report.lng,
        description: report.description,
        street_name: report.street_name || '',
        created_at: report.created_at,
        media_urls: report.media_urls || [],
        author_id: report.author_id
      }))
      
      setRoadReports(localReports)
      console.log(`Loaded ${localReports.length} reports from database`)
    } catch (error) {
      console.error('Error loading reports:', error)
      toast({
        title: "Error loading reports",
        description: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}. Using demo data.`,
        variant: "destructive"
      })
      // Keep using demo data as fallback
    }
  }

  // Load reports on component mount
  useEffect(() => {
    loadReportsFromSupabase()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
                    {/* Address field - MANDATORY */}
                    <div className="space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="address"
                          placeholder="123 Main St, Houston, TX"
                          value={reportForm.address}
                          onChange={(e) => setReportForm({ ...reportForm, address: e.target.value })}
                          className="flex-1"
                        />
                        <Button 
                          type="button"
                          variant="outline" 
                          onClick={handleAddressGeocode}
                          disabled={!reportForm.address.trim()}
                        >
                          Find Location
                        </Button>
                      </div>
                    </div>

                    {/* Location status */}
                    <div className="text-sm text-muted-foreground">
                      {selectedLocation 
                        ? `Location found: ${selectedLocation[0].toFixed(4)}, ${selectedLocation[1].toFixed(4)}` 
                        : "Enter address and click 'Find Location'"
                      }
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
                        disabled={!reportForm.address.trim() || !reportForm.description.trim() || !selectedLocation}
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
                        <div className="flex items-center gap-1 text-sm text-blue-600 mt-1">
                          <MapPin className="h-3 w-3" />
                          {report.street_name}
                        </div>
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
              Click "Add Report" and enter an address to place a pin • Reports must be inside Houston city limits
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
        onDelete={handleDeleteReport}
        currentUserId={user?.sub}
      />
    </div>
  )
}
