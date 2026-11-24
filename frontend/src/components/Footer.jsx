// components/Footer.jsx
const Footer = () => (
  <footer className="bg-gray-900 text-white pt-8 pb-4 overflow-hidden relative">
    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px] -translate-y-1/2"></div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <div className="lg:col-span-1 space-y-3">
           <div className="flex items-center gap-3">
              <img src="/logo.png" alt="GyaanLMS logo" className="w-12 h-12 rounded-2xl object-cover shadow-2xl bg-white" />
              <div>
                 <p className="text-2xl font-black tracking-tight leading-none">Gyaan<span className="text-primary-600">LMS</span></p>
                 <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest leading-none mt-1">E-Learning Platform</p>
              </div>
           </div>
           <p className="text-sm font-bold text-gray-500 leading-relaxed uppercase tracking-widest opacity-60">Architecting the future through world-class professional training and mentorship.</p>
           <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-primary-600 transition-all cursor-pointer">🐦</div>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-primary-600 transition-all cursor-pointer">🔗</div>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-primary-600 transition-all cursor-pointer">🎥</div>
           </div>
        </div>

        <div className="grid grid-cols-2 lg:col-span-3 gap-4 lg:gap-6">
          <div className="space-y-3">
              <h4 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em]">Knowledge Base</h4>
              <ul className="space-y-2">
                 <li><a href="/courses" className="text-sm font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest">Master Lectures</a></li>
                 <li><a href="/about" className="text-sm font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest">Faculty Network</a></li>
                 <li><a href="/contact" className="text-sm font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest">Global Support</a></li>
              </ul>
          </div>
          <div className="space-y-3">
              <h4 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em]">Corporate</h4>
              <ul className="space-y-2">
                 <li><p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Brainybeam Info-Tech Pvt Ltd</p></li>
                 <li><p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Enterprise Solutions</p></li>
                 <li><p className="text-xs font-black text-white uppercase tracking-widest">support@gyaanlms.com</p></li>
              </ul>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3">
        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">© {new Date().getFullYear()} GyaanLMS. All Rights Reserved. @shubhamrdg </p>
        <div className="flex gap-4">
           <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] hover:text-primary-600 transition-colors cursor-pointer">Terms</p>
           <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] hover:text-primary-600 transition-colors cursor-pointer">Privacy</p>
           <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] hover:text-primary-600 transition-colors cursor-pointer">Cookies</p>
        </div>
      </div>
    </div>
  </footer>
)

export default Footer
