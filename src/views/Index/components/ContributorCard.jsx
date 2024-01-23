import PageLoader from "@/components/Loader/PageLoader";
import MyContext from "@/provider/context";
import { getContributor } from "@/state/home/contributor";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

export default function ContributorCard(params) {

    const { isMobile } = useContext(MyContext);
    const { t } = useTranslation();
    const { data, status } = useQuery({
        queryKey: ["contributor"],
        queryFn: () => getContributor(),
    });

    if (status === "error") return

    return (
        <div className="contributor">
            <p className="contributor-label">{t("home.page.contributor")}</p>
            <div className="ofh">
                <div className="contributor-content">
                    {status === "pending" ? (
                        <PageLoader />
                    ) : (
                        data?.map((e, i) =>
                            e?.link ? (
                                <a
                                    className="a"
                                    href={e.link}
                                    target="_blank"
                                    key={i}
                                >
                                    <div className="contributor-item img">
                                        <img src={e.avatar} alt="" />
                                    </div>
                                    <div
                                        className={
                                            isMobile ? "usernameM" : "username"
                                        }
                                    >
                                        {e.name}
                                    </div>
                                </a>
                            ) : (
                                <div className="a">
                                    <div className="contributor-item img">
                                        <img src={e.avatar} alt="" />
                                    </div>
                                    <div
                                        className={
                                            isMobile ? "usernameM" : "username"
                                        }
                                    >
                                        {e.name}
                                    </div>
                                </div>
                            )
                        )
                    )}
                </div>
            </div>
            {/* {
                contributor.length > count &&
                <div className="btn-drop" onClick={dropdown}>
                    <DownOutlined />
                </div>
            } */}
        </div>
    );
}
