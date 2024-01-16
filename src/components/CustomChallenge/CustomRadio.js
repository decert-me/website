import { Radio } from 'antd';
import { useEffect, useRef, useState } from 'react';
import CustomViewer from '../CustomViewer';
import { useTranslation } from 'react-i18next';
import { shuffle } from '@/utils/shullfe';

export default function CustomRadio(props) {
    
    const { label, value, options, defaultValue, plugins, isPreview, answer } = props;
    let [items, setItems] = useState();
    const { t } = useTranslation(["explore"]);
    const domRef = useRef(null);

    const onChange = (e) => {
        value(e.target.value, "multiple_choice")
    };

    function changeDom(params) {
        const dom = document.querySelectorAll(".ant-radio-wrapper-checked");
        if (domRef.current && dom.length > 0) {
          // DOM渲染完成后执行的操作
          const p = document.createElement("p");
          p.classList.add("preivew-correct");
          p.innerText = `(${t("correct")})`;
          dom.forEach(e => {
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
    

    return(
        <div className="CustomRadio Radio" ref={domRef}>
            <div className="inner-title">
                <CustomViewer label={label} />
            </div>
            {
                items &&
                <Radio.Group className='CustomRadio' options={items} onChange={onChange} defaultValue={isPreview ? answer : defaultValue?.value} />
            }
        </div>
    )
}