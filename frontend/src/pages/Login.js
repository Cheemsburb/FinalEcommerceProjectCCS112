import React, { useState, useEffect } from 'react';
import style from './styles/Login.module.css';
import pic1 from "../assets/designs/login/submariner.jpg"
import pic2 from "../assets/designs/login/submariner2.jpg"
import { Link } from 'react-router-dom';
// Member 5: Gladwyn Sencil
// Original images array
const images = [pic1, pic2];
// Create a "filmstrip" by duplicating the first image at the end
const displayImages = [pic1, pic2, pic1];

// This is the duration of our CSS transition. It must match the CSS.
const TRANSITION_DURATION = 700; // 0.7s

// SVG Icon for showing password
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

// SVG Icon for hiding password
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

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [isJumping, setIsJumping] = useState(false); // This state controls the "jump"

  // 5-second interval logic
  useEffect(() => {
    const interval = setInterval(() => {
      // Just move to the next slide
      setActiveIndex(prev => prev + 1);
    }, 5000); // 5000 milliseconds = 5 seconds
    return () => clearInterval(interval);
  }, []);

  // This effect handles the "jump" back to the start
  useEffect(() => {
    // We only care about this when we've just slid to the *last* image (the duplicate)
    if (activeIndex === displayImages.length - 1) {
      // Wait for the slide animation (0.7s) to finish
      const jumpTimer = setTimeout(() => {
        setIsJumping(true); // Disable transitions
        setActiveIndex(0); // Instantly jump to the first slide
      }, TRANSITION_DURATION);
      return () => clearTimeout(jumpTimer);
    }

    // This re-enables transitions *after* the jump has happened
    if (activeIndex === 0 && isJumping) {
      const reenableTimer = setTimeout(() => {
        setIsJumping(false);
      }, 50); // A tiny delay to let React render the jump
      return () => clearTimeout(reenableTimer);
    }
  }, [activeIndex, isJumping]);


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
  };

  return (
    <div className={style.loginPage}>
      <div className={style.card}>
        <div className={style.formSide}>
          <h1>Login</h1>
          <p className={style.subtitle}>
            Do not have an account. <Link to="/register">create a new one.</Link>
          </p>

          <form onSubmit={handleSubmit}>
            <div className={style.formGroup}>
              <label htmlFor="email">Enter Your Email Or Phone</label>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="michael.joe@xmail.com"
                required
              />
            </div>

            <div className={style.formGroup}>
              <label htmlFor="password">Enter Your Password</label>
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

            <button type="submit" className={style.loginButton}>
              Login
            </button>
          </form>

          <a href="#" className={style.forgotLink}>
            Forgot Your Password
          </a>
        </div>

        <div className={style.imageSide}>
          {/* We map over the displayImages (with 3 items) */}
          {displayImages.map((img, index) => (
            <div
              key={index}
              // We add the .noTransition class when we're jumping
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

export default Login;