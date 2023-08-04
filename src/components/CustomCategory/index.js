import { forwardRef, useImperativeHandle, useState } from "react";
import "./index.scss"
import { useUpdateEffect } from "ahooks";

function CustomCategory(props, ref) {
    
    const { 
        items, 
        label,
        sidebarIndex,
        allSelectItems,
        changeSelectItems
    } = props;

    useImperativeHandle(ref, () => ({
        removeSelect
    }))

    let [selectItems, setSelectItems] = useState([]);
    const [isActive, setIsActive] = useState(true);

    function handleSelect(item) {
        const index = selectItems.findIndex(e => e.key === item.key);
        if (index === -1) {
            selectItems.push(item);
        }else{
            selectItems.splice(index, 1);
        }
        setSelectItems([...selectItems]);
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
        // const isReduce = newArr.length < selectItems.length;
        if (newArr.length === selectItems.length) {
            return
        }
        selectItems = newArr;
        setSelectItems([...selectItems]);
    },[allSelectItems])

    return (
        <div className="CustomCategory">
            <div className="label">
                <p>{label}</p>
                <div 
                    className="arrow" 
                    onClick={() => setIsActive(!isActive)}
                />
            </div>
            <div className={`items ${isActive ? "" : "items-hide"}`}>
                {
                    items.map(item =>
                        <div 
                            key={item.key}
                            className={`item ${selectItems.some(e => e.key === item.key) ? "item-active" : ""}`}
                            onClick={() => handleSelect(item)}
                        >
                            {item.label}
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default forwardRef(CustomCategory)