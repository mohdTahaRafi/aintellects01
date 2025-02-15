import React, { useEffect } from "react"
import homedata from "../data/homedata"
import Typewriter from "typewriter-effect"

 const Hero = () => {
  return (
    <>
      <section className='hero'>
        {homedata.map((val, i) => (
          <div className='heroContent'>
            <h3 className='fontSize' data-aos='fade-right'>
              {val.text}
            </h3>
            <h1>
              <Typewriter
                options={{
                  strings: [`${val.name}`, `${val.post}`, `${val.design}`],
                  autoStart: true,
                  loop: true,
                }}
              />
            </h1>
            <p data-aos='fade-left'>{val.desc}</p>
            
          </div>
        ))}
      </section>
    </>
  )
}
export default Hero;