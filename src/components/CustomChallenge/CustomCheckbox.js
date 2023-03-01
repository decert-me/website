import { Checkbox } from 'antd';
import { useEffect, useState } from 'react';

export default function CustomCheckbox(props) {

    const { label, value, options, defaultValue } = props;
    let [items, setItems] = useState();
    const onChange = (checkedValues) => {
        value(checkedValues)
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

    return (
        <div className="CustomCheckbox">
            <p className="inner-title">{label}</p>
            {
                items &&
                <Checkbox.Group 
                    className='custom-checkbox' 
                    options={items} 
                    onChange={onChange} 
                    defaultValue={defaultValue}
                />
            }
        </div>
    )
}