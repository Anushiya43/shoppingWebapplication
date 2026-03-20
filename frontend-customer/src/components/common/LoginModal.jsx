import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowLeft, ShieldAlert } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import Alert from '../common/Alert';

const LoginModal = ({ isOpen, onClose }) => {
  const loginWithGoogle = useAuthStore(state => state.loginWithGoogle);
  const loginWithPhone = useAuthStore(state => state.loginWithPhone);
  const verifyPhoneOtp = useAuthStore(state => state.verifyPhoneOtp);
  const [step, setStep] = useState('choice'); // choice, phone, otp
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      
      // Auto-focus the close button or first input for accessibility
      // Delay slightly for React 19 stability
      setTimeout(() => {
         modalRef.current?.querySelector('button, input')?.focus();
      }, 50);

      // Lock scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      if (isOpen) {
        document.body.style.overflow = 'unset';
        // Delay focus restoration
        setTimeout(() => {
          previousFocusRef.current?.focus();
        }, 0);
      }
    };
  }, [isOpen]);

  // Trap focus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || e.key !== 'Tab') return;

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

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
    <div 
      className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="presentation"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        className="bg-white w-full max-w-sm rounded-[4px] shadow-lg relative overflow-hidden border border-gray-300 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          aria-label="Close modal"
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded transition-colors text-gray-500"
        >
          <X size={18} />
        </button>

        <div className="p-8">
          <div className="mb-6 flex items-center gap-2">
            {(step === 'phone' || step === 'otp') && (
              <button 
                onClick={() => setStep(step === 'otp' ? 'phone' : 'choice')}
                aria-label="Go back"
                className="p-1 hover:bg-gray-100 rounded-full transition-colors -ml-2"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 id="login-modal-title" className="text-2xl font-normal text-amazon-text">
              {step === 'otp' && isNewUser ? 'Create account' : 'Sign in'}
            </h2>
          </div>

          {error && (
            <Alert title="There was a problem">
              {error}
            </Alert>
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
                <span className="flex-shrink mx-4 text-gray-400 text-xs text font-normal">New to Amazon?</span>
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
                By continuing, you agree to Amazon's <span className="text-amazon-blue hover:text-amazon-orange underline cursor-pointer">Conditions of Use</span> and <span className="text-amazon-blue hover:text-amazon-orange underline cursor-pointer">Privacy Notice</span>.
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
    </div>
  );
};

export default LoginModal;
