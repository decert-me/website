import { useEffect, useState } from "react";
import "@/assets/styles/component-style/index"


export default function Pagination(props) {
    
    const { pageConfig, togglePage } = props;
    let [pages, setPages] = useState();

    useEffect(() => {
        pages = Math.ceil(pageConfig.total / pageConfig.pageSize);
        setPages(pages);
    },[pageConfig])

    return (
        <div className="Pagination">
            {
                pages > 0 &&
                Array.from({length: pages}).map((e,i) => 
                    <div 
                        className={`box ${pageConfig.page === i+1 ? "active" : ""}`} 
                        key={i}
                        onClick={() => {togglePage(i+1)}}
                    >{i+1}</div>
                )
            }
        </div>
    )
}