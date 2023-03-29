import { Viewer } from '@bytemd/react';
import { Radio } from 'antd';
import { useEffect, useState } from 'react';

export default function CustomRadio(props) {
    
    const { label, value, options, defaultValue, plugins } = props;
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
            <div className="inner-title">
                <Viewer value={label} plugins={plugins} />
            </div>
            {
                items &&
                <Radio.Group className='CustomRadio' options={items} onChange={onChange} defaultValue={defaultValue} />
            }
        </div>
    )
}