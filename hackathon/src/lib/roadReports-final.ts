import { supabase } from './supabase'
import type { RoadReport, RoadReportInsert, RoadReportWithCoords } from '@/types/database'

export class RoadReportsAPI {
  // Create a new road report (images stored locally, only report data in database)
  static async createReport(
    reportData: {
      address: string
      description: string
      media_files: File[]
      coordinates: { lat: number; lng: number }
    },
    user: {
      sub: string
      given_name?: string
      family_name?: string
      email?: string
      name?: string
    }
  ): Promise<RoadReport> {
    if (!user.sub) {
      throw new Error('User must be authenticated to create reports')
    }

    // Store images locally and create local URLs
    const localImageUrls: string[] = []
    if (reportData.media_files.length > 0) {
      console.log(`📸 Storing ${reportData.media_files.length} files locally`)
      
      for (const file of reportData.media_files) {
        console.log(`📸 Processing: ${file.name} (${file.type}, ${file.size} bytes)`)
        
        // Create a local URL for the file
        const localUrl = URL.createObjectURL(file)
        localImageUrls.push(localUrl)
        
        console.log('✅ Local URL created:', localUrl)
      }
      
      console.log(`📸 Final local URLs:`, localImageUrls)
    } else {
      console.log('📸 No media files to store')
    }

    // Create the report - only store report data in database, no image URLs
    const reportInsert: RoadReportInsert = {
      author_id: user.sub, // Use author_id to match your database
      geom: `POINT(${reportData.coordinates.lng} ${reportData.coordinates.lat})`,
      street_name: reportData.address,
      description: reportData.description,
      media_urls: null // Don't store image URLs in database
    }

    const { data, error } = await supabase
      .from('road_reports')
      .insert(reportInsert)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create report: ${error.message}`)
    }

    // Return the database data with local image URLs
    return {
      ...data,
      media_urls: localImageUrls.length > 0 ? localImageUrls : null
    }
  }

  // Get all road reports - matches your database structure
  static async getAllReports(): Promise<RoadReportWithCoords[]> {
    try {
      const { data, error } = await supabase
        .from('road_reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Database error:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      if (!data || data.length === 0) {
        console.log('No reports found in database')
        return []
      }

      // Convert PostGIS geometry to lat/lng
      return data.map(report => {
        let lng = 0
        let lat = 0

        // Handle PostGIS geometry format
        if (report.geom) {
          if (report.geom.coordinates && Array.isArray(report.geom.coordinates)) {
            // GeoJSON format
            lng = report.geom.coordinates[0] || 0
            lat = report.geom.coordinates[1] || 0
          } else if (typeof report.geom === 'string') {
            // WKT format - extract coordinates
            const match = report.geom.match(/POINT\(([^)]+)\)/)
            if (match) {
              const coords = match[1].split(' ')
              lng = parseFloat(coords[0]) || 0
              lat = parseFloat(coords[1]) || 0
            }
          } else if (report.geom && typeof report.geom === 'object') {
            // Handle other geometry formats
            try {
              // Try to extract coordinates from various PostGIS formats
              if (report.geom.x !== undefined && report.geom.y !== undefined) {
                lng = report.geom.x
                lat = report.geom.y
              }
            } catch {
              console.warn('Could not parse geometry:', report.geom)
            }
          }
        }

        return {
          id: report.id, // int4 ID
          author_id: report.author_id, // Auth0 user ID
          street_name: report.street_name || '',
          description: report.description || '',
          media_urls: report.media_urls || [],
          created_at: report.created_at || new Date().toISOString(),
          lng,
          lat
        }
      })
    } catch (error) {
      console.error('Error in getAllReports:', error)
      throw error
    }
  }

  // Test database connection
  static async testConnection(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('road_reports')
        .select('count')
        .limit(1)

      if (error) {
        console.error('Connection test failed:', error)
        return false
      }

      console.log('Database connection successful')
      return true
    } catch (error) {
      console.error('Connection test error:', error)
      return false
    }
  }

  // Get user's name from Auth0 user object
  static getUserDisplayName(user: {
    given_name?: string
    family_name?: string
    name?: string
  }): string {
    if (user.given_name && user.family_name) {
      return `${user.given_name} ${user.family_name}`
    }
    if (user.name) {
      return user.name
    }
    if (user.given_name) {
      return user.given_name
    }
    return 'Anonymous User'
  }

  // Get user's first name
  static getUserFirstName(user: {
    given_name?: string
    name?: string
  }): string {
    if (user.given_name) {
      return user.given_name
    }
    if (user.name) {
      return user.name.split(' ')[0]
    }
    return 'Anonymous'
  }

  // Delete a road report
  static async deleteReport(reportId: number, userId: string): Promise<boolean> {
    try {
      // First verify the user owns this report
      const { data: existingReport, error: fetchError } = await supabase
        .from('road_reports')
        .select('author_id, media_urls')
        .eq('id', reportId)
        .single()

      if (fetchError) {
        throw new Error(`Report not found: ${fetchError.message}`)
      }

      if (existingReport.author_id !== userId) {
        throw new Error('You can only delete your own reports')
      }

      // Delete associated media files from storage if any
      if (existingReport.media_urls && existingReport.media_urls.length > 0) {
        for (const url of existingReport.media_urls) {
          try {
            // Extract filename from URL
            const fileName = url.split('/').pop()
            if (fileName) {
              await supabase.storage
                .from('road-reports')
                .remove([fileName])
            }
          } catch (storageError) {
            console.warn('Failed to delete media file:', storageError)
            // Continue with report deletion even if media deletion fails
          }
        }
      }

      // Delete the report
      const { error: deleteError } = await supabase
        .from('road_reports')
        .delete()
        .eq('id', reportId)

      if (deleteError) {
        throw new Error(`Failed to delete report: ${deleteError.message}`)
      }

      return true
    } catch (error) {
      console.error('Error deleting report:', error)
      throw error
    }
  }
}
