import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Smartphone, Hash, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Alert from '../components/common/Alert';

const LoginPage = () => {
  const { loginWithGoogle, loginWithPhone, verifyPhoneOtp } = useAuth();
  const [step, setStep] = useState('choice'); // choice, phone, otp
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginWithPhone(phoneNumber);
      setIsNewUser(res.data.isNewUser);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await verifyPhoneOtp(phoneNumber, otp, firstName, lastName);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4 py-20">
        <div className="bg-white w-full max-w-sm rounded-[4px] shadow-lg overflow-hidden border border-gray-300">
          <div className="p-8">
            <div className="mb-6 flex items-center gap-2">
              {(step === 'phone' || step === 'otp') && (
                <button 
                  onClick={() => setStep(step === 'otp' ? 'phone' : 'choice')}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors -ml-2"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <h2 className="text-2xl font-normal text-amazon-text">
                {step === 'otp' && isNewUser ? 'Create account' : 'Sign in'}
              </h2>
            </div>

            {error && (
              <div className="mb-4">
                <Alert title="There was a problem">
                  {error}
                </Alert>
              </div>
            )}

            {step === 'choice' && (
              <div className="space-y-4">
                <button
                  onClick={loginWithGoogle}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2 bg-white border border-gray-300 text-amazon-text rounded-[3px] text-sm hover:bg-gray-50 shadow-sm transition-all"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                  Continue with Google
                </button>
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-xs text font-normal">New to ModernShop?</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>
                <button
                  onClick={() => setStep('phone')}
                  className="w-full px-4 py-2 bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:from-[#f5d78e] text-amazon-text rounded-[3px] text-sm shadow-sm transition-all"
                >
                  Continue with Phone
                </button>
              </div>
            )}

            {step === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[13px] font-bold text-amazon-text">Mobile number</label>
                  <div className="flex">
                    <div className="px-3 py-2 bg-gray-100 border border-gray-400 border-r-0 rounded-l-[3px] text-sm text-gray-500">+91</div>
                    <input
                      type="tel"
                      required
                      autoFocus
                      placeholder="00000 00000"
                      className="w-full px-3 py-2 bg-white border border-gray-400 rounded-r-[3px] focus:border-amazon-orange focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none text-sm"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || phoneNumber.length < 10}
                  className="w-full py-1.5 bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:from-[#f5d78e] text-amazon-text rounded-[3px] text-sm shadow-sm transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Continue'}
                </button>
                <p className="text-[12px] text-amazon-text-gray mt-4 leading-tight">
                  By continuing, you agree to ModernShop's <span className="text-amazon-blue hover:text-amazon-orange underline cursor-pointer">Conditions of Use</span> and <span className="text-amazon-blue hover:text-amazon-orange underline cursor-pointer">Privacy Notice</span>.
                </p>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                {isNewUser && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[13px] font-bold text-amazon-text">First name</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 bg-white border border-gray-400 rounded-[3px] focus:border-amazon-orange focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none text-sm"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[13px] font-bold text-amazon-text">Last name</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 bg-white border border-gray-400 rounded-[3px] focus:border-amazon-orange focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none text-sm"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[13px] font-bold text-amazon-text">6-digit OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    className="w-full px-3 py-2 bg-white border border-gray-400 rounded-[3px] focus:border-amazon-orange focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none text-sm"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                  <p className="text-[11px] text-amazon-text-gray">Verification code sent to +91 {phoneNumber}</p>
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full py-1.5 bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:from-[#f5d78e] text-amazon-text rounded-[3px] text-sm shadow-sm transition-all disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : (isNewUser ? 'Create account' : 'Sign in')}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LoginPage;
