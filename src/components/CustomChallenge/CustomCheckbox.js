import { Checkbox } from 'antd';
import { useEffect, useRef, useState } from 'react';
import CustomViewer from '../CustomViewer';
import { useTranslation } from 'react-i18next';
import { shuffle } from '@/utils/shullfe';

export default function CustomCheckbox(props) {

    const { label, value, options, defaultValue, plugins, isPreview, answer } = props;
    let [items, setItems] = useState();
    const { t } = useTranslation(["explore"]);
    const domRef = useRef(null);


    const onChange = (checkedValues) => {
        checkedValues.sort((a, b) => a - b);
        value(checkedValues,"multiple_response");
    };

    function changeDom(params) {
        const dom = document.querySelectorAll(".ant-checkbox-wrapper-checked");
        if (domRef.current && dom.length > 0) {
          // DOM渲染完成后执行的操作
          dom.forEach(e => {
              const p = document.createElement("p");
              p.classList.add("preivew-correct");
              p.innerText = `(${t("correct")})`;
              e.appendChild(p);
          })
        }
    }

    useEffect(() => {
        let arr = [];
        options.map((e,i) => {
            arr.push({
                label: e,
                value: i
            })
        })
        items = shuffle(arr);
        setItems([...items]);
    },[options])

    useEffect(() => {
        isPreview && changeDom()
    }, [domRef.current]);

    return (
        <div className="CustomCheckbox" ref={domRef}>
            <div className="inner-title">
                {/* <Viewer value={label} plugins={plugins} /> */}
                <CustomViewer label={label} />
            </div>
            {
                items &&
                <Checkbox.Group 
                    className='custom-checkbox' 
                    options={items} 
                    onChange={onChange} 
                    defaultValue={isPreview ? answer : defaultValue?.value}
                />
            }
        </div>
    )
}