import { useTranslation } from "react-i18next";

/**
 *
 * @param {Boolean} claimable - 可领取状态
 * @param {Boolean} claimed - 已领取状态
 * @param {Boolean} review - 待打分状态
 * @returns
 */

export default function ChallengeItemStatus({
    claimable,
    claimed,
    review,
}) {
    const { t } = useTranslation(["profile"]);

    return (
        <>
            {claimable && <div className="item-claimable">{t("claimble")}</div>}
            {claimed && <div className="item-claimed">{t("explore:pass")}</div>}
            {review && (
                <div
                    className="item-claimed"
                    style={{ borderColor: "#007DFA", color: "#007DFA" }}
                >
                    {t("explore:review")}
                </div>
            )}
        </>
    );
}
