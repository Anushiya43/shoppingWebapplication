import React, { useState } from 'react';
import useAuthStore from '../../store/useAuthStore';
import { googleLoginUrl } from '../../api/auth';
import { X, ShieldAlert, LogIn, Smartphone, Hash } from 'lucide-react';

const LoginModal = ({ isOpen, onClose }) => {
  const { loginWithPhone, verifyPhoneOtp } = useAuthStore();
  const [step, setStep] = useState('choice'); // choice, phone, otp
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loginWithGoogle = () => {
    window.location.href = googleLoginUrl;
  };

  if (!isOpen) return null;

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
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-slate-100">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 z-10">
          <X size={20} />
        </button>

        <div className="p-10 text-center relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-primary-indigo/5 rounded-2xl flex items-center justify-center mb-2">
              <ShieldAlert className="text-primary-indigo" size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Admin <span className="text-accent-blue">Panel</span>
              </h2>
              <p className="text-slate-500 font-medium">
                {step === 'otp' && isNewUser ? 'Complete your profile.' : 'Secure dashboard access.'}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-semibold flex items-center gap-3 border border-red-100">
              <X size={16} /> {error}
            </div>
          )}

          {step === 'choice' && (
            <div className="space-y-4">
              <button
                onClick={loginWithGoogle}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
              >
                <LogIn size={20} /> Continue with Google
              </button>
              <button
                onClick={() => setStep('phone')}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95"
              >
                <Smartphone size={20} /> Continue with Phone
              </button>
            </div>
          )}

          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-6 text-left">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="tel"
                    required
                    placeholder="+1 234 567 890"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
              <button
                type="button"
                onClick={() => setStep('choice')}
                className="w-full text-slate-500 text-sm font-medium hover:text-slate-900 transition-colors"
              >
                Go Back
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-6 text-left">
              {isNewUser && (
                <div className="grid grid-cols-2 gap-4 auto-cols-auto">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">First Name</label>
                    <input
                      type="text"
                      required
                      placeholder="John"
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Last Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Doe"
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2 text-center">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl text-sm font-medium inline-block mb-2">
                  OTP sent to {phoneNumber}
                </div>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-[0.5em] font-bold text-xl"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : (isNewUser ? 'Complete Setup' : 'Verify OTP')}
              </button>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-slate-500 text-sm font-medium hover:text-slate-900 transition-colors text-center"
              >
                Change Phone Number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
