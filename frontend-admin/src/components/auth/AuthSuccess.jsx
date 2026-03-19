import { useSearchParams, useNavigate } from 'react-router-dom';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      navigate(`/?error=${error}`);
      return;
    }

    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const userId = searchParams.get('user_id');

    if (accessToken && refreshToken) {
      localStorage.setItem('access_token_admin', accessToken);
      localStorage.setItem('refresh_token_admin', refreshToken);
      if (userId) localStorage.setItem('user_id_admin', userId);
      navigate('/');
      window.location.reload();
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-slate">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin w-10 h-10 border-4 border-accent-blue border-t-transparent rounded-full"></div>
        <div className="font-black text-slate-900 tracking-tight uppercase text-xs tracking-[0.2em]">Authenticating Admin...</div>
      </div>
    </div>
  );
};

export default AuthSuccess;
