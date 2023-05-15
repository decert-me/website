import { Radio } from 'antd';
import { useEffect, useState } from 'react';
import CustomViewer from '../CustomViewer';

export default function CustomRadio(props) {
    
    const { label, value, options, defaultValue, plugins } = props;
    let [items, setItems] = useState();

    const onChange = (e) => {
        value(e.target.value, "multiple_choice")
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
                <CustomViewer label={label} />
            </div>
            {
                items &&
                <Radio.Group className='CustomRadio' options={items} onChange={onChange} defaultValue={defaultValue} />
            }
        </div>
    )
}