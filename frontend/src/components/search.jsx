import React from 'react';
import Loader from './Loader';

const Input = ({ value, onChange, disabled, placeholder, isSearching }) => {
  if (isSearching) {
    return (
      <div className="flex justify-center items-center my-8">
        <Loader />
      </div>
    );
  }

  return (
    <div className="styled-search-wrapper">
      <style>{`
        .styled-search-wrapper .grid {
          height: 800px;
          width: 800px;
          background-image: linear-gradient(to right, #0f0f10 1px, transparent 1px),
            linear-gradient(to bottom, #0f0f10 1px, transparent 1px);
          background-size: 1rem 1rem;
          background-position: center center;
          position: absolute;
          z-index: -1;
          filter: blur(1px);
        }
        .styled-search-wrapper .white,
        .styled-search-wrapper .border,
        .styled-search-wrapper .darkBorderBg,
        .styled-search-wrapper .glow {
          max-height: 78px;
          max-width: 563px;
          height: 100%;
          width: 100%;
          position: absolute;
          overflow: hidden;
          z-index: -1;
          /* Border Radius */
          border-radius: 12px;
          filter: blur(3px);
        }
        .styled-search-wrapper .input {
          background-color: #010201;
          border: none;
          width: 550px;
          height: 64px;
          border-radius: 10px;
          color: white;
          padding-left: 24px;
          padding-right: 64px;
          font-size: 20px;
        }
        .styled-search-wrapper #poda {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .styled-search-wrapper .input::placeholder {
          color: #c0b9c0;
        }

        .styled-search-wrapper .input:focus {
          outline: none;
        }

        .styled-search-wrapper #main:focus-within > #input-mask {
          display: none;
        }

        .styled-search-wrapper #input-mask {
          pointer-events: none;
          width: 100px;
          height: 20px;
          position: absolute;
          background: linear-gradient(90deg, transparent, black);
          top: 22px;
          left: 30px;
        }
        .styled-search-wrapper #pink-mask {
          pointer-events: none;
          width: 30px;
          height: 20px;
          position: absolute;
          background: #cf30aa;
          top: 10px;
          left: 5px;
          filter: blur(20px);
          opacity: 0.8;
          transition: all 2s;
        }
        .styled-search-wrapper #main:hover > #pink-mask {
          opacity: 0;
        }

        .styled-search-wrapper .white {
          max-height: 71px;
          max-width: 556px;
          border-radius: 10px;
          filter: blur(2px);
        }

        .styled-search-wrapper .white::before {
          content: "";
          z-index: -2;
          text-align: center;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(83deg);
          position: absolute;
          width: 600px;
          height: 600px;
          background-repeat: no-repeat;
          background-position: 0 0;
          filter: brightness(1.4);
          background-image: conic-gradient(
            rgba(0, 0, 0, 0) 0%,
            #a099d8,
            rgba(0, 0, 0, 0) 8%,
            rgba(0, 0, 0, 0) 50%,
            #dfa2da,
            rgba(0, 0, 0, 0) 58%
          );
          transition: all 2s;
        }
        .styled-search-wrapper .border {
          max-height: 67px;
          max-width: 552px;
          border-radius: 11px;
          filter: blur(0.5px);
        }
        .styled-search-wrapper .border::before {
          content: "";
          z-index: -2;
          text-align: center;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(70deg);
          position: absolute;
          width: 600px;
          height: 600px;
          filter: brightness(1.3);
          background-repeat: no-repeat;
          background-position: 0 0;
          background-image: conic-gradient(
            #1c191c,
            #402fb5 5%,
            #1c191c 14%,
            #1c191c 50%,
            #cf30aa 60%,
            #1c191c 64%
          );
          transition: all 2s;
        }
        .styled-search-wrapper .darkBorderBg {
          max-height: 73px;
          max-width: 561px;
        }
        .styled-search-wrapper .darkBorderBg::before {
          content: "";
          z-index: -2;
          text-align: center;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(82deg);
          position: absolute;
          width: 600px;
          height: 600px;
          background-repeat: no-repeat;
          background-position: 0 0;
          background-image: conic-gradient(
            rgba(0, 0, 0, 0),
            #18116a,
            rgba(0, 0, 0, 0) 10%,
            rgba(0, 0, 0, 0) 50%,
            #6e1b60,
            rgba(0, 0, 0, 0) 60%
          );
          transition: all 2s;
        }
        .styled-search-wrapper #poda:hover > .darkBorderBg::before {
          transform: translate(-50%, -50%) rotate(262deg);
        }
        .styled-search-wrapper #poda:hover > .glow::before {
          transform: translate(-50%, -50%) rotate(240deg);
        }
        .styled-search-wrapper #poda:hover > .white::before {
          transform: translate(-50%, -50%) rotate(263deg);
        }
        .styled-search-wrapper #poda:hover > .border::before {
          transform: translate(-50%, -50%) rotate(250deg);
        }

        .styled-search-wrapper #poda:hover > .darkBorderBg::before {
          transform: translate(-50%, -50%) rotate(-98deg);
        }
        .styled-search-wrapper #poda:hover > .glow::before {
          transform: translate(-50%, -50%) rotate(-120deg);
        }
        .styled-search-wrapper #poda:hover > .white::before {
          transform: translate(-50%, -50%) rotate(-97deg);
        }
        .styled-search-wrapper #poda:hover > .border::before {
          transform: translate(-50%, -50%) rotate(-110deg);
        }

        .styled-search-wrapper #poda:focus-within > .darkBorderBg::before {
          transform: translate(-50%, -50%) rotate(442deg);
          transition: all 4s;
        }
        .styled-search-wrapper #poda:focus-within > .glow::before {
          transform: translate(-50%, -50%) rotate(420deg);
          transition: all 4s;
        }
        .styled-search-wrapper #poda:focus-within > .white::before {
          transform: translate(-50%, -50%) rotate(443deg);
          transition: all 4s;
        }
        .styled-search-wrapper #poda:focus-within > .border::before {
          transform: translate(-50%, -50%) rotate(430deg);
          transition: all 4s;
        }

        .styled-search-wrapper .glow {
          overflow: hidden;
          filter: blur(30px);
          opacity: 0.4;
          max-height: 138px;
          max-width: 603px;
        }
        .styled-search-wrapper .glow:before {
          content: "";
          z-index: -2;
          text-align: center;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(60deg);
          position: absolute;
          width: 999px;
          height: 999px;
          background-repeat: no-repeat;
          background-position: 0 0;
          background-image: conic-gradient(
            #000,
            #402fb5 5%,
            #000 38%,
            #000 50%,
            #cf30aa 60%,
            #000 87%
          );
          transition: all 2s;
        }

        @keyframes rotate {
          100% {
            transform: translate(-50%, -50%) rotate(450deg);
          }
        }
        @keyframes leftright {
          0% {
            transform: translate(0px, 0px);
            opacity: 1;
          }

          49% {
            transform: translate(250px, 0px);
            opacity: 0;
          }
          80% {
            transform: translate(-40px, 0px);
            opacity: 0;
          }

          100% {
            transform: translate(0px, 0px);
            opacity: 1;
          }
        }
        .styled-search-wrapper #main {
          position: relative;
        }
        .styled-search-wrapper #search-icon {
          position: absolute;
          right: 20px;
          top: 20px;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
        }
      `}</style>
      <div>
        <div className="grid" />
        <div id="poda">
          <div className="glow" />
          <div className="darkBorderBg" />
          <div className="darkBorderBg" />
          <div className="darkBorderBg" />
          <div className="white" />
          <div className="border" />
          <div id="main">
            <input 
              placeholder={placeholder || "Search..."} 
              type="text" 
              name="text" 
              className="input" 
              value={value}
              onChange={onChange}
              disabled={disabled}
            />
            <div id="input-mask" />
            <div id="pink-mask" />
            <button 
              type="submit" 
              id="search-icon" 
              disabled={disabled}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width={24} viewBox="0 0 24 24" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" height={24} fill="none" className="feather feather-search">
                <circle stroke="url(#search)" r={8} cy={11} cx={11} />
                <line stroke="url(#searchl)" y2="16.65" y1={22} x2="16.65" x1={22} />
                <defs>
                  <linearGradient gradientTransform="rotate(50)" id="search">
                    <stop stopColor="#f8e7f8" offset="0%" />
                    <stop stopColor="#b6a9b7" offset="50%" />
                  </linearGradient>
                  <linearGradient id="searchl">
                    <stop stopColor="#b6a9b7" offset="0%" />
                    <stop stopColor="#837484" offset="50%" />
                  </linearGradient>
                </defs>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Input;
