import React from "react"
import Hero from '/src/components/home/Hero.jsx';
import  About  from "/src/components/pages/About.jsx";
import  About2  from "/src/components/pages/About2.jsx";
import  Services  from "/src/components/pages/Services";
import  Testimonials  from "/src/components/pages/Testimonial";


export const Home = () => {
  return (
    <>
      <Hero />
      <About />
      <About2 />
      <Services />
      <Testimonials />
       </>
  );
}
