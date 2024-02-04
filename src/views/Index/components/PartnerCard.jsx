import { useTranslation } from "react-i18next";


export default function PartnerCard(params) {
    
    const { t } = useTranslation();
    
    const partner = [
        "home-upchain",
        "home-buidler",
        "home-rebase",
        "home-chaintool",
        "home-aspecta",
        "home-nftscan",
    ]

    return (
        <div className="partner">
            <div className="partner-content">
                <p>{t("home.page.partner")}</p>
                <ul>
                    {
                        partner.map(e => 
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