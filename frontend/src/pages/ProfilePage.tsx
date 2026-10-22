import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { PageShell } from '../components/PageShell';
import { User, LogOut, Calendar, ShieldCheck, Mail } from 'lucide-react';

export function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    navigate('/login?next=/profile', { replace: true });
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formattedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Semester 3 Session';

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-ink">My Profile</h1>
          <p className="text-[14px] text-muted mt-1">
            Registered account information for this Semester 3 prototype.
          </p>
        </div>

        <div className="bg-surface rounded-card shadow-card border border-border p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-border">
            <div className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-2xl border border-brand/20">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-ink">{user.full_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  user.role === 'admin'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {user.role} role
                </span>
                <span className="text-[13px] text-muted">ID #{user.id}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-page rounded-control border border-border/80">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-muted uppercase tracking-wider mb-1">
                <Mail className="w-3.5 h-3.5" />
                Email Address
              </div>
              <div className="text-[15px] font-medium text-ink break-all">{user.email}</div>
            </div>

            <div className="p-4 bg-page rounded-control border border-border/80">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-muted uppercase tracking-wider mb-1">
                <Calendar className="w-3.5 h-3.5" />
                Member Since
              </div>
              <div className="text-[15px] font-medium text-ink">{formattedDate}</div>
            </div>

            <div className="p-4 bg-page rounded-control border border-border/80">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-muted uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Authorization
              </div>
              <div className="text-[15px] font-medium text-ink">
                {user.role === 'admin' ? 'Administrator (Full Analytics Access)' : 'Student Reviewer (1 Review / Product)'}
              </div>
            </div>

            <div className="p-4 bg-page rounded-control border border-border/80">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-muted uppercase tracking-wider mb-1">
                <User className="w-3.5 h-3.5" />
                Session Storage
              </div>
              <div className="text-[15px] font-medium text-ink">Local JWT Bearer</div>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-medium text-error hover:bg-red-50 rounded-control border border-error/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out of session
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
