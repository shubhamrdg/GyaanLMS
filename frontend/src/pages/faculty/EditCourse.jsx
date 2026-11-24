import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { toDateInputValue } from '../../utils/coursePricing'
import Spinner from '../../components/Spinner'

const API_URL =
  import.meta.env.VITE_API_URL.replace('/api', '')

const EditCourse = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [thumbnail, setThumbnail] = useState(null)
  const [preview, setPreview] = useState('')
  const [offerEnabled, setOfferEnabled] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', price: '', category: 'Web Development',
    level: 'Beginner', tags: '', requirements: '', whatYouLearn: '', totalDuration: '',
    offerPrice: '', offerLabel: '', offerEndsAt: ''
  })

  const priceValue = Number(form.price) || 0
  const offerValue = Number(form.offerPrice) || 0
  const hasValidOffer = offerEnabled && offerValue > 0 && offerValue <= priceValue
  const offerDiscount = hasValidOffer ? Math.round(((priceValue - offerValue) / priceValue) * 100) : 0

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId || courseId === 'undefined') return;
      try {
        const { data } = await api.get(`/courses/${courseId}`)
        setForm({
          title: data.title || '',
          description: data.description || '',
          price: data.price || 0,
          category: data.category || 'Web Development',
          level: data.level || 'Beginner',
          tags: data.tags?.join('\n') || '',
          requirements: data.requirements?.join('\n') || '',
          whatYouLearn: data.whatYouLearn?.join('\n') || '',
          totalDuration: data.totalDuration || '',
          offerPrice: data.offerPrice ? String(data.offerPrice) : '',
          offerLabel: data.offerLabel || '',
          offerEndsAt: toDateInputValue(data.offerEndsAt)
        })
        setOfferEnabled(Boolean(data.offerPrice && data.offerPrice > 0))
        if (data.thumbnail) setPreview(`${API_URL}${data.thumbnail}`)
      } catch (err) {
        toast.error('Failed to load course details')
        navigate(-1)
      } finally {
        setLoading(false)
      }
    }
    fetchCourseData()
  }, [courseId, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (offerEnabled && offerValue > 0 && offerValue > priceValue) {
      return toast.error('Offer price cannot be higher than the course price.')
    }

    setUpdating(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'tags' || k === 'requirements' || k === 'whatYouLearn') {
          formData.append(k, JSON.stringify(v.split('\n').filter(Boolean)))
        } else {
          formData.append(k, v)
        }
      })
      if (thumbnail) formData.append('thumbnail', thumbnail)

      await api.put(`/courses/${courseId}`, formData)
      toast.success('Course updated successfully!')
      navigate(-1)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update course')
    } finally { setUpdating(false) }
  }

  if (loading) return <Spinner />

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold dark:text-white mb-6">Edit Course</h1>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label">Course Title *</label>
          <input type="text" className="input" placeholder="e.g. Full Stack Web Development"
            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        </div>

        <div>
          <label className="label">Description *</label>
          <textarea className="input" rows={4} placeholder="Describe what students will learn..."
            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category *</label>
            <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {['Web Development', 'Data Science', 'AI/ML', 'Mobile Development', 'Design', 'DevOps', 'Database', 'Other'].map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Level *</label>
            <select className="input" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Price (₹) — Set 0 for free</label>
            <input type="number" className="input" placeholder="999" min="0"
              value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
          </div>
          <div>
            <label className="label">Course Duration *</label>
            <div className="flex gap-2">
              <select
                className="input flex-1"
                value={['1 Months', '2 Months', '3 Months', '4 Months', '5 Months', '6 Months'].includes(form.totalDuration) ? form.totalDuration : 'Custom'}
                onChange={e => {
                  const val = e.target.value;
                  setForm({ ...form, totalDuration: val === 'Custom' ? '' : val });
                }}
              >
                {['1 Months', '2 Months', '3 Months', '4 Months', '5 Months', '6 Months', 'Custom'].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {(!['1 Months', '2 Months', '3 Months', '4 Months', '5 Months', '6 Months'].includes(form.totalDuration) || form.totalDuration === '') && (
                <input
                  type="text"
                  className="input flex-1 animate-in slide-in-from-left-1 duration-200"
                  placeholder="e.g. 8 Weeks"
                  value={form.totalDuration}
                  onChange={e => setForm({ ...form, totalDuration: e.target.value })}
                />
              )}
            </div>
          </div>
        </div>

        {/* Offer / Discount Section */}
        <div className="p-5 rounded-2xl border-2 border-dashed border-primary-200 dark:border-gray-700 bg-primary-50/40 dark:bg-gray-900/40 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100">🎁 Offer / Discount</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Show a discounted price next to the original price for a limited time.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={offerEnabled}
                onChange={e => {
                  const enabled = e.target.checked
                  setOfferEnabled(enabled)
                  if (!enabled) setForm(prev => ({ ...prev, offerPrice: '', offerLabel: '', offerEndsAt: '' }))
                }}
              />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Enable</span>
            </label>
          </div>

          {offerEnabled && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Offer Price (₹) *</label>
                  <input type="number" className="input" min="0" placeholder="499"
                    value={form.offerPrice} onChange={e => setForm({ ...form, offerPrice: e.target.value })} />
                </div>
                <div>
                  <label className="label">Offer Label</label>
                  <input type="text" className="input" maxLength={40} placeholder="Launch Offer / Festive Sale"
                    value={form.offerLabel} onChange={e => setForm({ ...form, offerLabel: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="label">Offer Ends On (optional)</label>
                <input type="date" className="input"
                  value={form.offerEndsAt} onChange={e => setForm({ ...form, offerEndsAt: e.target.value })} />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">
                  Leave empty for an ongoing offer. After this date students automatically see the original price.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Students will see</span>
                <div className="flex items-center gap-3 flex-wrap">
                  {hasValidOffer ? (
                    <>
                      {offerDiscount > 0 && (
                        <span className="text-xs font-bold text-gray-400 line-through">₹{priceValue.toLocaleString('en-IN')}</span>
                      )}
                      <span className="text-lg font-black text-primary-600">₹{offerValue.toLocaleString('en-IN')}</span>
                      {offerDiscount > 0 && (
                        <span className="text-[10px] font-black text-white bg-accent-600 px-2 py-1 rounded-lg">{offerDiscount}% OFF</span>
                      )}
                      {form.offerLabel && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded-lg">{form.offerLabel}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-sm font-black text-gray-700 dark:text-gray-200">
                      {priceValue === 0 ? 'FREE' : `₹${priceValue.toLocaleString('en-IN')}`}
                    </span>
                  )}
                </div>
              </div>

              {offerValue > 0 && offerValue > priceValue && (
                <p className="text-xs font-bold text-red-500">
                  Offer price cannot be higher than the course price (₹{priceValue.toLocaleString('en-IN')}).
                </p>
              )}
            </>
          )}
        </div>

        <div>
          <label className="label">Thumbnail Image</label>
          <div className="flex items-center gap-4">
            {preview && <img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border dark:border-gray-700" />}
            <div className="flex-1">
              <input type="file" accept="image/*" className="input" onChange={e => {
                const file = e.target.files[0]
                setThumbnail(file)
                if (file) setPreview(URL.createObjectURL(file))
              }} />
            </div>
          </div>
        </div>

        <div>
          <label className="label">Tags </label>
          <textarea className="input" rows={2} placeholder="React&#10;Node.js&#10;MongoDB"
            value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
        </div>

        <div>
          <label className="label">Requirements</label>
          <textarea className="input" rows={3} placeholder="Basic JavaScript knowledge"
            value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} />
        </div>

        {/*<div>
          <label className="label">What Students Will Learn (one per line)</label>
          <textarea className="input" rows={3} placeholder="Build full stack apps"
            value={form.whatYouLearn} onChange={e => setForm({...form, whatYouLearn: e.target.value})} />
        </div>*/}

        <div className="flex gap-3">
          <button type="submit" className="btn-primary px-8 py-2.5" disabled={updating}>
            {updating ? 'Updating...' : 'Update Course'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-8 py-2.5">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditCourse
