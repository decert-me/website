import logo_white from "@/assets/images/svg/logo-white.png";
import { Divider } from 'antd';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function AppFooter({ isMobile }) {
    
  const location = useLocation();
  let [hide, setHide] = useState("block");
  const urls = [
    {label: "Dune", value: "https://dune.com/upchaindao/decert"},
    {label: "Twitter", value: "https://twitter.com/decertme"},
    {label: "Discord", value: `https://discord.gg/kuSZHftTqe`},
    {label: "Github", value: "https://github.com/decert-me"},
  ]

  function init(params) {
    const page = location.pathname;
    if(page.indexOf("challenge") !== -1){
      hide = "none";
    }else{
      hide = "block";
    }
    setHide(hide);
  }

  useEffect(() => {
    isMobile && init();
  },[location, isMobile])

    return (
        <div id="Footer" style={{display: hide}}>
          <div className="footer-content">
              {/* logo info */}
            <div className="left">
              <div className="logo">
                <img src={logo_white} alt="" />
              </div>
              <p>You are what you build.</p>
            </div>
            {/* right icon */}
            <div className="right">
              {
                urls.map(e => 
                  <a key={e.value} href={e.value} target="_blank">{e.label}</a>
                )
              }
            </div>
          </div>
          <Divider />
          <div className="footer-record">
            <span className="versions">© 2025 DeCert.me</span>
            <br />
            <a href="https://beian.mps.gov.cn/#/query/webSearch" target="_blank">
              <img src="https://img.learnblockchain.cn/pics/20201202144947.png" style={{verticalAlign: "middle", marginRight: "2px"}}></img>
              <span className='versions' style={{color: "#fff"}}>粤公网安备 44049102497044 号 | </span>
            </a>
            <a href="https://beian.miit.gov.cn/" target="_blank"><span className='versions' style={{color: "#fff"}}>粤ICP备17140514号-3 | </span></a>
            <a href="https://beian.miit.gov.cn/" target="_blank"><span className='versions' style={{color: "#fff"}}>粤网信备44040224116904180018号</span></a>
          </div>
        </div>
    )
}