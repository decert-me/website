import { Viewer } from "@bytemd/react";
import { useEffect, useMemo } from "react";
import pluginGfm from '@bytemd/plugin-gfm'
import frontmatter from '@bytemd/plugin-frontmatter'
import highlight from '@bytemd/plugin-highlight'
import breaks from '@bytemd/plugin-breaks'
import { solidity } from 'highlightjs-solidity';


export default function CustomViewer(props) {

    const { label } = props;
    const plugins = useMemo(() => [pluginGfm(),frontmatter(),highlight({init: (e) => {
        e.registerLanguage("solidity", solidity)
    }}),breaks()], [])
    

    function init(params) {
        // 添加a标签为新标签页跳转
        const dom = document.querySelectorAll(".markdown-body a");
        for (let i = 0; i < dom.length; i++) {
            dom[i].setAttribute('target', '_blank');
        }
    }

    useEffect(() => {
        init();        
    },[])

    return (
        <Viewer value={label} plugins={plugins} />
    )
}