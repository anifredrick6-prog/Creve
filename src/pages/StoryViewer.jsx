import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { X, BadgeCheck } from 'lucide-react'

const STORY_DURATION_MS = 5000

function StoryViewer() {
  const { vendorId } = useParams()
  const navigate = useNavigate()
  const [stories, setStories] = useState([])
  const [index, setIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [loadingData, setLoadingData] = useState(true)
  const intervalRef = useRef(null)

  useEffect(() => {
    async function load() {
      setLoadingData(true)
      const { data } = await supabase
        .from('stories')
        .select('id, image_url, caption, vendor_id, created_at, profiles(full_name, verified, avatar_url)')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      const seenVendors = new Set()
      const oneStoryPerVendor = []
      for (const story of data ?? []) {
        if (!seenVendors.has(story.vendor_id)) {
          seenVendors.add(story.vendor_id)
          oneStoryPerVendor.push(story)
        }
      }

      setStories(oneStoryPerVendor)
      const startIndex = oneStoryPerVendor.findIndex((s) => s.vendor_id === vendorId)
      setIndex(startIndex >= 0 ? startIndex : 0)
      setLoadingData(false)
    }
    load()
  }, [vendorId])

  useEffect(() => {
    if (loadingData || stories.length === 0) return

    setProgress(0)
    const start = Date.now()

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / STORY_DURATION_MS) * 100, 100)
      setProgress(pct)

      if (pct >= 100) {
        clearInterval(intervalRef.current)
        goNext()
      }
    }, 50)

    return () => clearInterval(intervalRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, loadingData, stories.length])

  function goNext() {
    if (index >= stories.length - 1) {
      navigate('/marketplace')
    } else {
      setIndex((i) => i + 1)
    }
  }

  function goPrev() {
    setIndex((i) => Math.max(0, i - 1))
  }

  if (loadingData) {
    return <div className="min-h-screen bg-ink" />
  }

  if (stories.length === 0) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center flex-col gap-4">
        <p className="text-white text-sm">No active stories right now.</p>
        <Link to="/marketplace" className="text-coral text-sm font-semibold">
          Back to marketplace
        </Link>
      </div>
    )
  }

  const story = stories[index]
  const vendor = story.profiles

  return (
    <div className="min-h-screen bg-ink relative overflow-hidden">
      <div className="absolute top-3 left-3 right-3 z-20 flex gap-1.5">
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full bg-white/25 overflow-hidden">
            <div
              className="h-full bg-white"
              style={{
                width: i < index ? '100%' : i === index ? `${progress}%` : '0%',
              }}
            />
          </div>
        ))}
      </div>

      <div className="absolute top-7 left-3 right-3 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {vendor?.avatar_url ? (
            <img src={vendor.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
              {vendor?.full_name?.[0] ?? '?'}
            </div>
          )}
          <span className="text-white text-sm font-semibold">{vendor?.full_name}</span>
          {vendor?.verified && <BadgeCheck size={15} className="text-white" strokeWidth={2.5} />}
        </div>
        <button
          onClick={() => navigate('/marketplace')}
          className="w-8 h-8 flex items-center justify-center text-white"
          aria-label="Close"
        >
          <X size={20} strokeWidth={2.5} />
        </button>
      </div>

      <img src={story.image_url} alt="" className="w-full h-screen object-contain" />

      {story.caption && (
        <div className="absolute bottom-8 left-4 right-4 z-20">
          <p className="text-white text-sm bg-black/40 rounded-xl px-4 py-2.5 backdrop-blur-sm">
            {story.caption}
          </p>
        </div>
      )}

      <button
        onClick={goPrev}
        className="absolute left-0 top-0 w-1/3 h-full z-10"
        aria-label="Previous story"
      />
      <button
        onClick={goNext}
        className="absolute right-0 top-0 w-1/3 h-full z-10"
        aria-label="Next story"
      />

      <Link
        to={`/vendor/${story.vendor_id}`}
        className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 text-white/70 text-xs font-semibold underline"
      >
        View vendor profile
      </Link>
    </div>
  )
}

export default StoryViewer
