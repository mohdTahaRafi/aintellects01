import React, { useEffect } from "react";
//import { Settings, CropRotate, ViewInAr, PieChart, Code, BarChart } from "@material-ui/icons";
import Heading from "../common/heading";
import services from "../data/servicesdata";
import AOS from "aos";
import "aos/dist/aos.css";

const Services = () => {
  useEffect(() => {
    AOS.init();
  }, []);

 

  return (
    <section className='services'>
      <div className='container'>
        <Heading title='Services' />
        <div className='content grid3'>
          {services.map((item) => (
            <div className='box' data-aos='flip-left' key={item.id}>
             
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
