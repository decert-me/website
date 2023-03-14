import { useEffect, useState } from "react";


export default function Pagination(props) {
    
    const { pageConfig } = props;
    let [pages, setPages] = useState();

    useEffect(() => {
        pages = Math.ceil(pageConfig.total / pageConfig.pageSize);
        setPages(pages);
        console.log(pages);
    },[pageConfig])

    return (
        <div className="Pagination">
            {
                pages &&
                Array.from(pages).map((e,i) => 
                    <div>{i}</div>
                )
            }
        </div>
    )
}