import React from "react";
import "../utils/App.css";   // correct import path
import { Link, useNavigate } from "react-router-dom";


export default function LandingPage() {

    const router = useNavigate();
  return (
    <div className="landingPageContainer">
        <nav>
            <div className="navHeader">
                <h2>Apna Video Call</h2>
            </div>
            <div className="navList">
                <p onClick={()=>{
                    router( "/q23q23")
                }}>Join as guest</p>
                <p onClick={()=>{
                    router("/auth")
                }}>Register</p>
                <div onClick={()=>{
                    router("/auth")
                }}role="button">
                    <p>Login</p>
                </div>

            </div>
        </nav>
        <div className="landingMainContainer">
            <div>
                <h1><span style={{color:"#FF9839"}}>Connect</span> with your <span style={{color:"#FF9839"}}>loved ones</span></h1>
                <p>Cover a distance by Apna Video Call</p>
                <div role="button">
                  <Link to={"/auth"}>Get Started</Link>
                </div>
            </div>
            
            <div>
                <img src="/mobile3.png" alt="" srcset="" />
            </div>

        </div>
    </div>
    
  );
}

