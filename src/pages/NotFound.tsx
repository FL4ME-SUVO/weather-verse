import React, { useEffect, useMemo } from "react"
import { Link, useLocation } from "react-router-dom"
import { AlertCircle } from "lucide-react"

const STAR_COUNT = 80

const NotFound = () => {
  const location = useLocation()

  // generate stars once
  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }).map(() => {
        const dx = (Math.random() - 0.5) * 40 // drift ±20px
        const dy = (Math.random() - 0.5) * 40 // drift ±20px
        const twinkleD = (Math.random() * 3 + 2).toFixed(2) + "s"
        const driftD = (Math.random() * 30 + 20).toFixed(2) + "s"
        const delay = (Math.random() * 5).toFixed(2) + "s"
        return {
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          size: `${Math.random() * 2.5 + 1.5}px`, // 1.5–4px
          dx: `${dx}px`,
          dy: `${dy}px`,
          twinkleD,
          driftD,
          delay,
        }
      }),
    [],
  )

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    )
  }, [location.pathname])

  return (
    <>
      <style>{`.notfound-container{position:relative;width:100vw;height:100vh;background:radial-gradient(circle at top left,#2e026d,#090029);overflow:hidden;color:#fff}.star,.star-field{position:absolute}.star-field{inset:0;z-index:1}.star{background:#fff;border-radius:50%;opacity:0;animation:twinkle var(--tw-d) ease-in-out var(--tw-delay) infinite,drift var(--dr-d) linear var(--dr-delay) infinite}@keyframes twinkle{0%,100%{opacity:0}50%{opacity:1}}@keyframes drift{from{transform:translate(0,0)}to{transform:translate(var(--dx),var(--dy))}}.content-wrapper{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;padding:0 1rem}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}.animate-float{animation:4s ease-in-out infinite float}.icon{width:4rem;height:4rem;color:#ff4e50;margin-bottom:1rem}.big-text{font-size:6rem;margin:.2rem 0;color:#ff4e50;animation:3s infinite flicker}@keyframes flicker{0%,100%,19%,21%,23%,25%,54%,56%{opacity:1;text-shadow:0 0 8px #ff4e50,0 0 20px #ff4e50,0 0 30px #ff4e50}20%,24%,55%{opacity:.8;text-shadow:none}}.sub-text{font-size:1.5rem;margin:.5rem 0 1rem}.path-pill{font-family:monospace;background:rgba(255,255,255,.1);padding:.2rem .5rem;border-radius:.25rem}.home-button{padding:.6rem 1.2rem;border:2px solid #ff4e50;color:#ff4e50;border-radius:9999px;background:0 0;text-decoration:none;transition:.2s;font-weight:500}.home-button:hover{background:#ff4e50;color:#fff;transform:scale(1.05)}`}</style>

      <div className="notfound-container">
        <div className="star-field">
          {stars.map((s, i) => (
            <div
              key={i}
              className="star"
              style={{
                top: s.top,
                left: s.left,
                width: s.size,
                height: s.size,
                "--dx": s.dx,
                "--dy": s.dy,
                "--tw-d": s.twinkleD,
                "--dr-d": s.driftD,
                "--tw-delay": s.delay,
                "--dr-delay": s.delay,
              }}
            />
          ))}
        </div>

        <div className="content-wrapper">
          <AlertCircle className="icon animate-float" />
          <h1 className="big-text">404</h1>
          <p className="sub-text">
            We can’t find <span className="path-pill">{location.pathname}</span>
          </p>
          <Link
            to="/"
            className="home-button"
          >
            Return Home
          </Link>
        </div>
      </div>
    </>
  )
}

export default NotFound
