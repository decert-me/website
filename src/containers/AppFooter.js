import Twitter from '@/assets/images/icon/twitter.png'
import Discord from '@/assets/images/icon/discord.png'
import Notion from '@/assets/images/icon/notion.png'
import Github from '@/assets/images/icon/github.png'

export default function AppFooter(params) {
    

    return (
        <div id="Footer">
            {/* logo info */}
          <div className="left">
            <div className="logo">
              <img src={require("@/assets/images/img/logo-white.png")} alt="" />
            </div>
            <p className="describe">You are what you build.</p>
            <span className="versions">© 2023 DeCert.me | </span>
            <a href="https://beian.miit.gov.cn/" target="_blank"><span className='versions' style={{color: "#fff"}}>粤ICP备17140514号-3</span></a>
            
          </div>
          {/* right icon */}
          <div className="right">
            <img src={Notion} onClick={()=>{window.open('https://decert.notion.site/Decert-me-8b479c6e443740f192a56f2e090829ab','_blank')}} />
            <img src={Twitter} onClick={()=>{window.open('https://twitter.com/DecertMe','_blank')}}></img>
            <img src={Discord} onClick={()=>{window.open(`https://discord.gg/${process.env.REACT_APP_DISCORD_VERIFY_INVITE_LINK}`,'_blank')}}/>
            <img src={Github} onClick={()=>{window.open('https://github.com/decert-me','_blank')}} />
          </div>
        </div>
    )
}