import { Viewer } from "@bytemd/react";
import { useMemo } from "react";
import pluginGfm from '@bytemd/plugin-gfm'
import frontmatter from '@bytemd/plugin-frontmatter'
import highlight from '@bytemd/plugin-highlight-ssr'
import breaks from '@bytemd/plugin-breaks'


export default function CustomViewer(props) {

    const { label } = props;
    const plugins = useMemo(() => [pluginGfm(),frontmatter(),highlight(),breaks()], [])
    
    return (
        <Viewer value={label} plugins={plugins} />
    )
}