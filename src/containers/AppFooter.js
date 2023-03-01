import Twitter from '@/assets/images/icon/twitter.png'
import Discord from '@/assets/images/icon/discord.png'
import Notion from '@/assets/images/icon/notion.png'
import Github from '@/assets/images/icon/github.png'

export default function AppFooter(params) {
    

    return (
        <div id="Footer">
            {/* logo info */}
          <div className="left">
            <h3 className="logo">Decert.me</h3>
            <p className="describe">You are what you build.</p>
            <span className="versions">© 2022 Decert.me</span>
          </div>
          {/* right icon */}
          <div className="right">
            <img src={Notion} onClick={()=>{window.open('https://decert.notion.site/Decert-me-8b479c6e443740f192a56f2e090829ab','_blank')}} />
            <img src={Twitter} onClick={()=>{window.open('https://twitter.com/DecertMe','_blank')}}></img>
            <img src={Discord} onClick={()=>{window.open('https://discord.gg/U3kRbnc6yG','_blank')}}/>
            <img src={Github} onClick={()=>{window.open('https://github.com/decert-me','_blank')}} />
          </div>
        </div>
    )
}