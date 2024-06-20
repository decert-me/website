import { forwardRef, useImperativeHandle, useState } from "react";
import "./index.scss"
import { useUpdateEffect } from "ahooks";
import { useTranslation } from "react-i18next";
import i18n from 'i18next';

function CustomCategory(props, ref) {
    
    const { 
        items, 
        sidebarIndex,
        allSelectItems,
        changeSelectItems
    } = props;

    useImperativeHandle(ref, () => ({
        removeSelect
    }))

    const { t } = useTranslation(["cert"]);
    let [selectItems, setSelectItems] = useState([]);
    const [isAll, setIsAll] = useState(true);
        
    function changeIsAll() {
        setIsAll(!isAll);
        changeSelectItems([])
    }

    function handleSelect(item) {
        selectItems = [item];
        setSelectItems([...selectItems]);
        setIsAll(false);
        // 返回新数组
        changeSelectItems(selectItems)
    }

    function removeSelect(key, index) {
        if (index !== sidebarIndex) {
            return
        }
        const i = selectItems.findIndex(e => e.key === key);
        selectItems.splice(i, 1);
        setSelectItems([...selectItems]);
    }

    useUpdateEffect(() => {
        const newArr = allSelectItems[sidebarIndex];
        if (newArr.length === selectItems.length) {
            return
        }
        selectItems = newArr;
        setSelectItems([...selectItems]);
    },[allSelectItems])

    return (
        <div className="CustomCategory">
            <div className="items">
                <div 
                    className={`item ${isAll ? "item-active" : ""}`}
                    onClick={() => changeIsAll()}
                >
                    {t("sidbar.list.all")}
                </div>
                {
                    items.map(item =>
                        <div 
                            key={item.ID}
                            className={`item ${selectItems.some(e => e.ID === item.ID) ? "item-active" : ""}`}
                            onClick={() => handleSelect(item)}
                        >
                            {i18n.language === "zh-CN" ? item.Chinese : item.English}
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default forwardRef(CustomCategory)