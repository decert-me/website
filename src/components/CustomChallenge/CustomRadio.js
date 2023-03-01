import { Radio } from 'antd';
import { useEffect, useState } from 'react';

export default function CustomRadio(props) {
    
    const { label, value, options, defaultValue } = props;
    let [items, setItems] = useState();

    const onChange = (e) => {
        value(e.target.value)
    };

    useEffect(() => {
        let arr = [];
        options.map((e,i) => {
            arr.push({
                label: e,
                value: i
            })
        })
        items = arr;
        setItems([...items]);
    },[])

    return(
        <div className="CustomRadio">
            <p className="inner-title">{label}</p>
            {
                items &&
                <Radio.Group className='CustomRadio' options={items} onChange={onChange} defaultValue={defaultValue} />
            }
        </div>
    )
}