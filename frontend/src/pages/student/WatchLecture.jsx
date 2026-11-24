// pages/student/WatchLecture.jsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ReactPlayer from 'react-player'
import api from '../../services/api'
import ProgressBar from '../../components/ProgressBar'
import Spinner from '../../components/Spinner'
import toast from 'react-hot-toast'
import getImageUrl from '../../utils/getImageUrl'
import downloadCertificate from '../../utils/downloadCertificate'
import { isYouTubeUrl } from '../../utils/youtube'
import MarkdownContent from '../../components/MarkdownContent'



const WatchLecture = () => {
  const { courseId } = useParams()
  const { user } = useSelector(state => state.auth)
  const [course, setCourse] = useState(null)
  const [lectures, setLectures] = useState([])
  const [currentLecture, setCurrentLecture] = useState(null)
  const [progress, setProgress] = useState({ percentage: 0, completedLectures: [] })
  const [loading, setLoading] = useState(true)
  const [queries, setQueries] = useState([])
  const [isQAModalOpen, setIsQAModalOpen] = useState(false)
  const [marking, setMarking] = useState(false)
  const [courseOutlineExpanded, setCourseOutlineExpanded] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, lectureRes, progressRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get(`/lectures/course/${courseId}`),
          api.get(`/progress/${courseId}`),
        ])
        setCourse(courseRes.data)
        setLectures(lectureRes.data)
        setCurrentLecture(lectureRes.data[0] || null)
        setProgress(progressRes.data)
        const queryRes = await api.get(`/queries/course/${courseId}`)
        setQueries(queryRes.data)
      } catch { }
      setLoading(false)
    }
    fetchData()
  }, [courseId])

  useEffect(() => {
    if (!isQAModalOpen) return

    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsQAModalOpen(false)
    }

    document.addEventListener('keydown', handleEscape)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = previousOverflow
    }
  }, [isQAModalOpen])


  const refreshQueries = async () => {
    try {
      const { data } = await api.get(`/queries/course/${courseId}`)
      setQueries(data)
    } catch { }
  }

  const markComplete = async (lectureId) => {
    if (!lectureId || marking) return
    if (isCompleted(lectureId)) {
      toast.success('Already marked complete')
      return
    }
    setMarking(true)
    try {
      const { data } = await api.put('/progress/update', { courseId, lectureId })
      // Normalize + merge so UI updates even if backend returns populated docs
      const completedIds = (data.completedLectures || []).map(l =>
        typeof l === 'object' ? String(l._id || l) : String(l)
      )
      setProgress({ ...data, completedLectures: completedIds })
      if (data.completed) toast.success('🎉 Course completed! Your certificate is ready to download.')
      else toast.success('Lecture marked complete!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update progress')
    } finally {
      setMarking(false)
    }
  }

  const completedIds = new Set((progress.completedLectures || []).map(l => String(l?._id ?? l)))
  const isCompleted = (lectureId) => completedIds.has(String(lectureId))
  const isCourseCompleted = progress.completed || progress.percentage === 100

  const handleDownloadCertificate = async () => {
    try {
      await downloadCertificate({ studentName: user?.name, courseName: course?.title })
      toast.success('Certificate opened in a new tab. Use the PDF viewer download option to save it.')
    } catch (error) {
      console.error('Certificate download failed:', error)
      toast.error(error.message || 'Could not generate the certificate. Please try again.')
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-t border-gray-200 dark:border-gray-800 dark:bg-gray-900 md:flex-row">
      <aside tabIndex={0} className={'flex w-full flex-shrink-0 flex-col overflow-y-auto border-b border-gray-200 bg-white custom-scrollbar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600 dark:border-gray-700 dark:bg-gray-800 md:border-b-0 md:border-r ' + (courseOutlineExpanded ? 'h-[68vh] min-h-[380px] max-h-[560px] md:h-full md:min-h-0 md:max-h-none md:w-[340px] xl:w-[380px]' : 'h-fit md:h-fit md:w-[300px]')} aria-label="Course content">
        <div className="sticky top-0 z-20 flex-shrink-0 border-b border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
              <span className="font-semibold text-gray-600 dark:text-gray-300">Course progress</span>
              <span className="font-bold text-gray-900 dark:text-white">{progress.percentage || 0}%</span>
            </div>
            <button
              type="button"
              onClick={() => setCourseOutlineExpanded(expanded => !expanded)}
              aria-expanded={courseOutlineExpanded}
              aria-label={courseOutlineExpanded ? 'Hide course content' : 'Show course content'}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <span aria-hidden="true">{courseOutlineExpanded ? '⌃' : '⌄'}</span>
            </button>
          </div>
          <ProgressBar percentage={progress.percentage || 0} showLabel={false} />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {completedIds.size} of {lectures.length} lessons completed
          </p>
        </div>

        {courseOutlineExpanded && (
          <>
            <button
              type="button"
              onClick={() => setIsQAModalOpen(true)}
              className="flex min-h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 px-5 text-left text-primary-800 transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600 dark:border-gray-700 dark:text-primary-300 dark:hover:bg-gray-700"
            >
              <span className="flex items-center gap-3 font-semibold">
                <span aria-hidden="true">💬</span>
                Course Discussions
              </span>
              <span aria-hidden="true" className="text-lg">↗</span>
            </button>

            <div className="flex-none">
              <h2 className="border-b border-gray-200 px-5 py-4 font-bold text-gray-900 dark:border-gray-700 dark:text-white">
                {course?.title || 'Course content'}
              </h2>
              <div className="space-y-1 p-3">
                {lectures.length ? lectures.map((lecture, index) => (
                  <button
                    key={lecture._id}
                    type="button"
                    onClick={() => setCurrentLecture(lecture)}
                    aria-current={currentLecture?._id === lecture._id ? 'true' : undefined}
                    className={'flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600 ' + (currentLecture?._id === lecture._id ? 'bg-primary-50 text-primary-900 dark:bg-primary-900/30 dark:text-primary-100' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50')}
                  >
                    <span className={'mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs ' + (isCompleted(lecture._id) ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300')}>
                      {isCompleted(lecture._id) ? '✓' : '▶'}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block break-words text-sm font-medium leading-5">{lecture.title}</span>
                      <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                        Lesson {index + 1}{lecture.duration ? ` · ${Math.floor(lecture.duration / 60)} min` : ''}
                      </span>
                    </span>
                  </button>
                )) : (
                  <p className="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400">No lessons have been added to this course yet.</p>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 z-10 mt-auto flex-shrink-0 border-t border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-800">
              {isCourseCompleted ? (
                <button
                  type="button"
                  onClick={handleDownloadCertificate}
                  className="flex items-center gap-3 font-semibold text-primary-800 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 disabled:cursor-not-allowed disabled:opacity-60 dark:text-primary-300"
                >
                  <span aria-hidden="true">🏅</span> View Certificate
                </button>
              ) : (
                <p className="flex items-center gap-3 font-semibold text-gray-500 dark:text-gray-400">
                  <span aria-hidden="true">🏅</span> Certificate
                </p>
              )}
            </div>
          </>
        )}
      </aside>
      {/* Main Content Area */}
      <div role="region" aria-label="Lecture content" tabIndex={0} className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600 custom-scrollbar dark:bg-gray-900">
        {currentLecture ? (
          <>
            {/* Video Player Section */}
            <div className="bg-black w-full aspect-video max-h-[52vh] flex-shrink-0 shadow-lg relative z-10 overflow-hidden">
              <ReactPlayer
                url={isYouTubeUrl(currentLecture.videoUrl) ? currentLecture.videoUrl : getImageUrl(currentLecture.videoUrl)}
                width="100%" height="100%"
                controls playing={false}
                onEnded={() => markComplete(currentLecture._id)}
              />
            
            </div>

            {/* Information Section */}
            <div className="flex-none">
              <div className="max-w-6xl mx-auto px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
                <div className="flex flex-col 2xl:flex-row justify-between items-start gap-5 border-b border-gray-200 dark:border-gray-800 pb-6">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900/30 text-[9px] font-black text-primary-600 uppercase tracking-widest">Selected Lecture</span>
                      <span className="h-px w-8 bg-gray-200 dark:bg-gray-700"></span>
                    </div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white leading-tight break-words">{currentLecture.title}</h1>
                    {currentLecture.description && (
                      <MarkdownContent source={currentLecture.description} className="max-w-3xl text-sm sm:text-base" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 2xl:flex gap-3 w-full sm:w-auto 2xl:max-w-[48%] 2xl:flex-shrink-0">
                    <button onClick={() => setIsQAModalOpen(true)}
                      className="btn-accent !px-5 !py-3.5 shadow-lg flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2">
                      💬 <span className="text-xs font-black">Open Q&amp;A</span>
                    </button>

                    {currentLecture.pdfUrl && (
                      <a href={getImageUrl(currentLecture.pdfUrl)} target="_blank" rel="noreferrer"
                        className="btn-secondary !px-5 !py-3.5 shadow-sm flex items-center justify-center gap-2 hover:bg-white dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2">
                        📄 <span className="text-xs font-black">Study Material</span>
                      </a>
                    )}

                    {!isCompleted(currentLecture._id) && (
                      <button onClick={() => markComplete(currentLecture._id)}
                        disabled={marking}
                        className="btn-primary !px-5 !py-3.5 shadow-lg flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
                        ✓ <span className="text-xs font-black">{marking ? 'Saving...' : 'Mark Complete'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/*                <div className="mt-12 opacity-50 text-center py-20 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[3rem]">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Lecture Resources & Community Discussions</p>
                </div>*/}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center animate-pulse">
              <div className="text-8xl mb-8 filter grayscale opacity-20">🎬</div>
              <p className="font-black uppercase tracking-[0.5em] text-xs text-gray-400">Select a lecture to proceed</p>
            </div>
          </div>
        )}

        {/* Q&A Modal Overlay */}
        {isQAModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsQAModalOpen(false) }}>
            <div role="dialog" aria-modal="true" aria-labelledby="qa-modal-title" className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-slide-up border border-white/10">
              <div className="p-8 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-2xl shadow-inner">💬</div>
                  <div>
                    <h3 id="qa-modal-title" className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Support & <span className="text-primary-600">Q&A</span></h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Direct Help from Instructors</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsQAModalOpen(false)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                  aria-label="Close Q&A dialog"
                >✕</button>
              </div>

              <div className="p-8 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Form Section */}
                <div className="bg-gray-50 dark:bg-gray-900/40 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-inner">
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const question = e.target.question.value;
                    if (!question) return;
                    try {
                      await api.post('/queries', { courseId, question });
                      toast.success('Query sent successfully!');
                      e.target.reset();
                      refreshQueries();
                    } catch { toast.error('Failed to send query'); }
                  }} className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3 block ml-1">Submit a New Doubt</label>
                      <textarea
                        name="question"
                        className="input !py-5 !px-8 min-h-[140px] !rounded-[1.5rem] text-sm shadow-sm border-none bg-white dark:bg-gray-800"
                        placeholder="What are you struggling with?"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn-primary !py-5 w-full !text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-600/30 transform hover:-translate-y-1 transition-all"
                    >Send Question to Faculty</button>
                  </form>
                </div>

                {/* History Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] whitespace-nowrap">Recent Discussions</h4>
                    <span className="h-px w-full bg-gray-100 dark:bg-gray-800"></span>
                  </div>

                  {queries.length === 0 ? (
                    <div className="text-center py-12 opacity-30">
                      <p className="text-xs font-bold uppercase tracking-[0.2em]">No history found</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {queries.map((q) => (
                        <div key={q._id} className="p-6 rounded-[2rem] bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-500 group">
                          <div className="flex justify-between items-start gap-4 mb-4">
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-primary-600 transition-colors">{q.question}</p>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${q.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'
                              }`}>
                              {q.status}
                            </span>
                          </div>
                          {q.answer && (
                            <div className="mt-5 p-5 rounded-2xl bg-primary-50/50 dark:bg-primary-900/10 border-l-4 border-primary-600 animate-fade-in">
                              <p className="text-[9px] font-black text-primary-600 uppercase tracking-[0.2em] mb-2">Faculty Answer</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{q.answer}</p>
                            </div>
                          )}
                          <div className="mt-4 flex items-center justify-between">
                            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Sent {new Date(q.createdAt).toLocaleDateString()}</p>
                            <div className="h-1 w-1 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5 bg-gray-50/50 dark:bg-gray-900/30 text-center border-t dark:border-gray-700">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic">Instructors usually respond within few hours</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WatchLecture
