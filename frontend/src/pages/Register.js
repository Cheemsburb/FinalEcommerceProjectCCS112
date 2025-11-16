import React, { useState, useEffect } from 'react';
import style from './styles/Register.module.css';
import pic1 from "../assets/designs/login/submariner.jpg"
import pic2 from "../assets/designs/login/submariner2.jpg"
import { Link } from 'react-router-dom';

// --- Carousel Logic (copied from Login) ---
const images = [pic1, pic2];
const displayImages = [pic1, pic2, pic1]; // [img1, img2, img1-clone]
const TRANSITION_DURATION = 700; // Must match CSS

// --- SVG Icons (copied from Login) ---
const EyeOpenIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeClosedIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

function Register() {
  // --- New states for Register form ---
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- Carousel states (copied from Login) ---
  const [activeIndex, setActiveIndex] = useState(0);
  const [isJumping, setIsJumping] = useState(false);

  // 5-second interval logic
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => prev + 1);
    }, 5000); // 5000 milliseconds = 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Effect to handle the "jump" back to the start
  useEffect(() => {
    if (activeIndex === displayImages.length - 1) {
      const jumpTimer = setTimeout(() => {
        setIsJumping(true); // Disable transitions
        setActiveIndex(0); // Instantly jump to the first slide
      }, TRANSITION_DURATION);
      return () => clearTimeout(jumpTimer);
    }
    if (activeIndex === 0 && isJumping) {
      const reenableTimer = setTimeout(() => {
        setIsJumping(false);
      }, 50);
      return () => clearTimeout(reenableTimer);
    }
  }, [activeIndex, isJumping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle your register logic here
    console.log('Register attempt:', { fullName, email, password, confirmPassword, agreeToTerms });
  };

  return (
    // We reuse the same class names as Login for consistency
    <div className={style.loginPage}>
      <div className={style.card}>
        <div className={style.formSide}>
          <h1>Signup</h1>
          <p className={style.subtitle}>
            Already Have An Account, <Link to="/login">Login.</Link>
          </p>

          <form onSubmit={handleSubmit}>
            {/* New grid layout for the inputs */}
            <div className={style.formGrid}>
              <div className={style.formGroup}>
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="michael.joe"
                  required
                />
              </div>

              <div className={style.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email" // Use type="email" for validation
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="michael.joe@xmail.com"
                  required
                />
              </div>

              <div className={style.formGroup}>
                <label htmlFor="password">Password</label>
                <div className={style.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className={style.eyeIcon}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                  </button>
                </div>
              </div>

              <div className={style.formGroup}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className={style.passwordWrapper}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    className={style.eyeIcon}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                  </button>
                </div>
              </div>
            </div> {/* End of formGrid */}

            {/* New Checkbox group */}
            <div className={style.checkboxGroup}>
              <input
                type="checkbox"
                id="agree"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                required
              />
              <label htmlFor="agree">
                I have read and agreed to the Terms of Service and Privacy Policy
              </label>
            </div>

            <button type="submit" className={style.loginButton}>
              Create Account
            </button>
          </form>

          {/* No "Forgot Password" link on register page */}
        </div>

        {/* --- Carousel (copied from Login) --- */}
        <div className={style.imageSide}>
          {displayImages.map((img, index) => (
            <div
              key={index}
              className={`${style.imageSlide} ${isJumping ? style.noTransition : ''}`}
              style={{
                backgroundImage: `url(${img})`,
                transform: `translateX(${(index - activeIndex) * 100}%)`,
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Register;