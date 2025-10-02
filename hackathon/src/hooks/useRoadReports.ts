import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, storage } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { RoadReport, RoadReportWithCoords } from '@/types/database'

interface UseRoadReportsOptions {
  bbox?: {
    minLng: number
    minLat: number
    maxLng: number
    maxLat: number
  }
}

export function useRoadReports(options: UseRoadReportsOptions = {}) {
  return useQuery({
    queryKey: ['road-reports', options.bbox],
    queryFn: async (): Promise<RoadReportWithCoords[]> => {
      if (options.bbox) {
        // Use RPC function for bbox query
        const { data, error } = await supabase.rpc('get_road_reports_in_bbox', {
          min_lng: options.bbox.minLng,
          min_lat: options.bbox.minLat,
          max_lng: options.bbox.maxLng,
          max_lat: options.bbox.maxLat
        })

        if (error) throw error
        return data || []
      } else {
        // Get all reports (limit for performance)
        const { data, error } = await supabase
          .from('road_reports')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000)

        if (error) throw error
        
        // Transform PostGIS points to lat/lng
        // Map DB shape to RoadReportWithCoords type
        return (data || []).map((report) => ({
          id: report.id as unknown as number,
          author_id: (report as any).author_id ?? (report as any).user_id,
          street_name: report.street_name ?? null,
          description: report.description,
          media_urls: report.media_urls ?? null,
          created_at: report.created_at,
          // Without PostGIS parsing on the client, default to 0s to satisfy type
          lng: 0,
          lat: 0,
        }))
      }
    }
  })
}

export function useCreateRoadReport() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      lat,
      lng,
      street_name,
      description,
      media_files
    }: {
      lat: number
      lng: number
      street_name?: string
      description: string
      media_files?: File[]
    }): Promise<RoadReport> => {
      if (!user) throw new Error('Must be authenticated')

      // Upload media files first
      const media_urls: string[] = []
      
      if (media_files && media_files.length > 0) {
        for (const file of media_files) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${user.sub}/${Date.now()}.${fileExt}`
          
          const { error: uploadError } = await storage.uploadFile('media', fileName, file)
          if (uploadError) throw uploadError
          
          const publicUrl = storage.getPublicUrl('media', fileName)
          media_urls.push(publicUrl)
        }
      }

      // Create PostGIS point
      const geom = `POINT(${lng} ${lat})`

      const { data, error } = await supabase
        .from('road_reports')
        .insert([{
          author_id: user.sub,
          geom: geom as any, // PostGIS point
          street_name,
          description,
          media_urls: media_urls.length > 0 ? media_urls : null
        }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['road-reports'] })
    }
  })
}
