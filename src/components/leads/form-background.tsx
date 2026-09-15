"use client";
import { useState } from "react";
export function FormBackground({background = "aurora", animated = true}:{background?: "aurora"|"grid"|"none";animated?:boolean}) {
  const [paused,setPaused] = useState(false);
  return <><div aria-hidden="true" className={`form-backdrop backdrop-${background} ${animated && !paused ? "is-moving":""}`}><i/><i/><i/></div>{animated && background !== "none" && <button type="button" className="form-motion" aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?"Resume background":"Pause background"}</button>}</>;
}
