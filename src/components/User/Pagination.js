import { useEffect, useState } from "react";
import "@/assets/styles/component-style/index"
import { Pagination } from "antd";

export default function Paginations(props) {
    
    const { pageConfig, togglePage } = props;
    let [pages, setPages] = useState();

    useEffect(() => {
        pages = Math.ceil(pageConfig.total / pageConfig.pageSize);
        setPages(pages);
    },[pageConfig])

    return (
        pageConfig.total > 0 &&
            <Pagination
                className="Pagination" 
                pageSize={10}
                total={pageConfig.total} 
                defaultCurrent={1}
                onChange={togglePage} 
            /> 
    )
}