import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  LogIn, 
  AlertCircle, 
  BookOpen, 
  PenTool, 
  Megaphone, 
  ShieldCheck, 
  Building2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const AuthModal: React.FC = () => {
  const { 
    authModalOpen, 
    authModalMode, 
    closeAuthModal, 
    loginWithGoogle, 
    loginWithEmail, 
    registerWithEmail,
    openLoginModal,
    openRegisterModal
  } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('reader');
  const [contributorBio, setContributorBio] = useState('');
  const [organization, setOrganization] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (authModalMode === 'login') {
        await loginWithEmail(email, password);
      } else {
        if (!name.trim()) {
          setErrorMsg('Nama lengkap tidak boleh kosong');
          setIsSubmitting(false);
          return;
        }
        await registerWithEmail({
          name: name.trim(),
          email: email.trim(),
          pass: password,
          role: selectedRole,
          contributorBio: contributorBio.trim(),
          organization: organization.trim()
        });
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorMsg('Email atau kata sandi tidak cocok.');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMsg('Email ini sudah terdaftar. Silakan langsung masuk.');
      } else if (code === 'auth/weak-password') {
        setErrorMsg('Kata sandi minimal 6 karakter.');
      } else if (code === 'auth/invalid-email') {
        setErrorMsg('Format alamat email tidak valid.');
      } else {
        setErrorMsg(err.message || 'Terjadi kesalahan autentikasi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg('Gagal masuk dengan Google: ' + (err.message || ''));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all my-auto max-h-[94vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="relative px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {authModalMode === 'login' ? 'Masuk ke INFOCEPAT' : 'Pendaftaran Akun Baru'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {authModalMode === 'login' 
                ? 'Akses artikel, bookmark favorit, dan ruang diskusi' 
                : 'Pilih peran akun sesuai kebutuhan Anda'}
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          {authModalMode === 'login' && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-medium text-sm text-slate-700 dark:text-slate-200 transition-all shadow-xs active:scale-[0.99] disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Masuk Cepat dengan Akun Google
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                <span className="bg-white dark:bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold absolute">
                  Atau Gunakan Email
                </span>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* ROLE SELECTION (Only on Registration) */}
            {authModalMode === 'register' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Pilih Peran Akun Anda:
                </label>
                
                <div className="grid grid-cols-1 gap-2.5">
                  {/* Option 1: Pembaca */}
                  <label 
                    onClick={() => setSelectedRole('reader')}
                    className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                      selectedRole === 'reader'
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-600'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="reader"
                      checked={selectedRole === 'reader'}
                      onChange={() => setSelectedRole('reader')}
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="font-bold text-xs text-slate-900 dark:text-white">Pembaca</span>
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-medium text-slate-600 dark:text-slate-400">Umum</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Akses penuh baca berita, simpan bookmark, tinggalkan komentar diskusi, dan melihat iklan sponsor portal.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Contributor */}
                  <label 
                    onClick={() => setSelectedRole('contributor')}
                    className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                      selectedRole === 'contributor'
                        ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 ring-1 ring-purple-600'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="contributor"
                      checked={selectedRole === 'contributor'}
                      onChange={() => setSelectedRole('contributor')}
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <PenTool className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="font-bold text-xs text-slate-900 dark:text-white">Kontributor Berita</span>
                        <span className="text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold px-1.5 py-0.5 rounded">Moderasi Admin</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Menulis berita dengan nama Anda; <strong>berita langsung tayang tanpa moderasi admin</strong> setelah akun Anda disetujui tim redaksi.
                      </p>
                    </div>
                  </label>

                  {/* Option 3: Pemasang Iklan */}
                  <label 
                    onClick={() => setSelectedRole('advertiser')}
                    className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                      selectedRole === 'advertiser'
                        ? 'border-amber-600 bg-amber-50/60 dark:bg-amber-950/40 ring-1 ring-amber-600'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="advertiser"
                      checked={selectedRole === 'advertiser'}
                      onChange={() => setSelectedRole('advertiser')}
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Megaphone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span className="font-bold text-xs text-slate-900 dark:text-white">Pemasang Iklan</span>
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded">Iklan & Kuota</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Akses khusus pilihan jenis slot iklan, kalkulator tarif per tayang & durasi, serta dashboard penayangan dan sisa kuota iklan.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Full Name */}
            {authModalMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap / Nama Penulis *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>
            )}

            {/* Contributor Extra Field */}
            {authModalMode === 'register' && selectedRole === 'contributor' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ringkasan Profil / Latar Belakang Penulisan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ceritakan pengalaman jurnalistik atau bidang keahlian Anda..."
                  value={contributorBio}
                  onChange={(e) => setContributorBio(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
                <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-1">
                  * Admin akan memeriksa data ini di menu Moderasi Kontributor sebelum mengaktifkan hak tulis berita Anda.
                </p>
              </div>
            )}

            {/* Advertiser Extra Field */}
            {authModalMode === 'register' && selectedRole === 'advertiser' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Perusahaan / Brand Pengiklan
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Contoh: PT Digital Media Nusantara"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kata Sandi *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {isSubmitting
                ? 'Memproses Akun...'
                : authModalMode === 'login'
                ? 'Masuk ke Akun'
                : `Daftar Sebagai ${selectedRole === 'contributor' ? 'Kontributor' : selectedRole === 'advertiser' ? 'Pemasang Iklan' : 'Pembaca'}`}
            </button>
          </form>

          {/* Switch mode */}
          <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
            {authModalMode === 'login' ? (
              <p>
                Belum memiliki akun?{' '}
                <button
                  onClick={openRegisterModal}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Daftar (Pilih Role)
                </button>
              </p>
            ) : (
              <p>
                Sudah punya akun?{' '}
                <button
                  onClick={openLoginModal}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Masuk di sini
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
