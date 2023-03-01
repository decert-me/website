import React, { useState, useMemo, useEffect } from "react"

import pluginGfm from '@bytemd/plugin-gfm'
import { Editor } from '@bytemd/react'
import frontmatter from '@bytemd/plugin-frontmatter'
import highlight from '@bytemd/plugin-highlight-ssr'
import breaks from '@bytemd/plugin-breaks'
import 'bytemd/dist/index.css'
import 'highlight.js/styles/default.css'
import importHtml from '@bytemd/plugin-import-html';
import zh_Hans from 'bytemd/locales/zh_Hans.json'
import { ipfsImg } from "@/request/api/public"


export default function CustomEditor(props) {
    
    const { changeTitle } = props;
    const plugins = useMemo(() => [pluginGfm(),frontmatter(),highlight(),breaks(),importHtml()], [])
    let [editValue, setEditValue] = useState('')

    useEffect(() => {
        if (editValue) {
            changeTitle(editValue)
        }
    },[editValue])

    return (
        <Editor
            value={editValue}
            plugins={plugins}
            locale={zh_Hans}
            uploadImages={async (files) => {
                let hash
                const formData = new FormData()
                formData.append('file',files[0])
                await ipfsImg(formData)
                .then((res)=>{
                    hash = res.hash
                })
                return [{
                    url: `http://ipfs.learnblockchain.cn/${hash}`
                }]
            }}
            onChange={(e) => {
                setEditValue(e)
            }}
            
        />
    )
}