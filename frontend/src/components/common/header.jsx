import { Menu } from "@mui/icons-material"
import React, { useState } from "react"
import { Link } from "react-router-dom"
import navlink from '/src/components/data/dummydata.js';


export const Header = () => {
  const [responsive, setResponsive] = useState(false)
  return (
    <>
    <div>
    <header>
      <div className='container flexsb'>
      <div className='logo'>
       <span>AIntellects</span>
      </div>
      <div className={responsive ? "hideMenu" : "nav"}>
        {navlink.map((links, i) => (
        <Link to={links.url} key={i} data-aos='zoom-in-left'>
          {links.text}
        </Link>
        ))}
      </div>
      <button className='toggle' onClick={() => setResponsive(!responsive)}>
        <Menu className='icon' />
      </button>
      </div>
    </header>
    </div>
    </>
  )
  }