import React, { useState, useEffect } from 'react';
import style from './styles/Login.module.css';
import pic1 from "../assets/designs/login/submariner.jpg";
import pic2 from "../assets/designs/login/submariner2.jpg";
import { Link, useNavigate } from 'react-router-dom';

const images = [pic1, pic2];
const displayImages = [pic1, pic2, pic1];
const TRANSITION_DURATION = 700;
const API_BASE_URL = 'http://localhost:8000/api'; // Define your API base URL

// Icon Components
const EyeOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeClosedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

function Login({ signIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const navigate = useNavigate();

  
  useEffect(() => {
    const interval = setInterval(() => setActiveIndex(prev => prev + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeIndex === displayImages.length - 1) {
      const jumpTimer = setTimeout(() => { setIsJumping(true); setActiveIndex(0); }, TRANSITION_DURATION);
      return () => clearTimeout(jumpTimer);
    }
    if (activeIndex === 0 && isJumping) {
      const reenableTimer = setTimeout(() => setIsJumping(false), 50);
      return () => clearTimeout(reenableTimer);
    }
  }, [activeIndex, isJumping]);
  

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    
    const loginData = {
      email: email,
      password: password,
    };

    try {
     
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) { 
        
        localStorage.setItem("userLoggedIn", "true");
        localStorage.setItem("currentUserEmail", data.user.email);
        localStorage.setItem("apiToken", data.token); 

        if (signIn) signIn(data.token, data.user);

        setSuccess("Login successful! Redirecting...");
        
        
        setPassword('');
        
        setTimeout(() => navigate("/"), 2000);
      } else {
       
        let errorMessage = 'Invalid email or password.';
        
        if (data.message) {
             errorMessage = data.message;
        }

        setError(errorMessage);
        console.error("Login Error Data:", data);
      }
    } catch (err) {
      
      setError("Connection error: Could not reach the API server. Is the backend running?");
      console.error("Fetch Error:", err);
    }
  };
 

  return (
    <div className={style.loginPage}>
      <div className={style.card}>
        <div className={style.formSide}>
          <h1>Login</h1>
          <p className={style.subtitle}>Do not have an account? <Link to="/register">create a new one.</Link></p>

          <form onSubmit={handleSubmit}>
            {success && <div style={{ color: 'green', marginBottom: '10px', fontWeight: '600' }}>{success}</div>}
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <div className={style.formGroup}>
              <label htmlFor="email">Enter Your Email</label>
              <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="michael.joe@xmail.com" required/>
            </div>

            <div className={style.formGroup}>
              <label htmlFor="password">Enter Your Password</label>
              <div className={style.passwordWrapper}>
                <input type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required/>
                <button type="button" className={style.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>
            </div>

            <button type="submit" className={style.loginButton}>Login</button>
          </form>
        </div>

        <div className={style.imageSide}>
          {displayImages.map((img, index) => (
            <div 
              key={index} 
              className={`${style.imageSlide} ${isJumping ? style.noTransition : ''}`} 
              style={{ backgroundImage: `url(${img})`, transform: `translateX(${(index - activeIndex) * 100}%)` }}>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Login;