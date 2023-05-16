import { Checkbox } from 'antd';
import { useEffect, useState } from 'react';
import CustomViewer from '../CustomViewer';

export default function CustomCheckbox(props) {

    const { label, value, options, defaultValue, plugins } = props;
    let [items, setItems] = useState();
    const onChange = (checkedValues) => {
        value(checkedValues,"multiple_response")
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
                    defaultValue={defaultValue?.value}
                />
            }
        </div>
    )
}