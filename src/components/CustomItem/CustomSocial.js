export default function CustomSocial(props) {
    
    const { socials } = props;

    const list = {
        discord: require("@/assets/images/img/discord-block.png")
    }
    // [
    //     { 
    //         label: "discord", 
    //         none: require("@/assets/images/img/discord-none.png"), 
    //         block: require("@/assets/images/img/discord-block.png") 
    //     }
    // ]
    
    return (
        <>
            {
                socials && 
                Object.keys(socials).map((e, i) => 
                    <div className="social-item" key={i}>
                        <div className="icon img">
                            <img src={list[e]} alt="" />
                        </div>
                        {
                            socials[e].username
                        }
                    </div>    
                )
            }
        </>
    )
}