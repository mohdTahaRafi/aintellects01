import  { useEffect } from "react";
import Heading from "../common/heading";
import aboutdata from "../data/aboutdata";
import AOS from "aos";
import "aos/dist/aos.css";

const About = () => {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <>
      <section className='about'>
        <div className='container flex'>
          {aboutdata.map((val) => (
            <>
              <div className='left' data-aos='fade-down-right'>
                <img src={val.cover} alt='' />
              </div>
              <div className='right' data-aos='fade-down-left'>
                <Heading title='AI POWERED TRAFFIC CONTROL SYSTEM' />
                <p>{val.desc}</p>   
                <p>{val.desc1}</p>
                
              </div>

            </>
          ))}
        </div>
      </section>
    </>
  );
};

export default About;
