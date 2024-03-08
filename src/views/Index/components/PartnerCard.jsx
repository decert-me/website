import { useTranslation } from "react-i18next";


export default function PartnerCard(params) {
    
    const { t } = useTranslation();
    
    const partner1 = [
        "home-upchain",
        "home-rebase",
        "home-gcc",
        "home-zcloak",
        "home-aspecta",
        "home-nftscan",
    ]
    const partner2 = [
        "home-openbuild",
        "home-plancker",
        "home-buidler",
        "home-chaintool",
        "home-4seas",
        "home-web3camp",
    ]

    return (
        <div className="partner">
            <div className="partner-content">
                <p>{t("home.page.partner")}</p>
                <ul>
                    {
                        partner1.map(e => 
                            <li className="img" key={e}>
                                <img src={require(`@/assets/images/img/${e}.png`)} alt="" />
                            </li>
                        )
                    }
                </ul>
                <ul style={{paddingTop: 0}}>
                    {
                        partner2.map(e => 
                            <li className="img" key={e}>
                                <img src={require(`@/assets/images/img/${e}.png`)} alt="" />
                            </li>
                        )
                    }
                </ul>
            </div>
        </div>
    )
}