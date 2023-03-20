export default function CustomSocial(props) {
    
    const { socials } = props;

    const list = [
        { 
            label: "discord", 
            none: require("@/assets/images/img/discord-none.png"), 
            block: require("@/assets/images/img/discord-block.png") 
        }
    ]

    return (
        <>
            {
                socials ?
                list.map(e => 
                    <div className="icon img" key={e.label}>
                        {
                            socials[e.label] ?
                            <img src={e.block} alt="" />
                            :
                            <img src={e.none} alt="" />
                        }
                    </div>
                )
                :
                list.map(e => 
                    <div className="icon img" key={e.label}>
                        <img src={e.none} alt="" />
                    </div>
                )
            }
        </>
    )
}