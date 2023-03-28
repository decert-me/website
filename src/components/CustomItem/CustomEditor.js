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
import i18n from 'i18next';
import { constans } from "@/utils/constans"


export default function CustomEditor(props) {
    
    const { changeTitle, onChange, id } = props;
    const { ipfsPath } = constans();
    const plugins = useMemo(() => [pluginGfm(),frontmatter(),highlight(),breaks(),importHtml()], [])
    let [editValue, setEditValue] = useState('')

    useEffect(() => {
        if (editValue) {
            changeTitle(editValue)
        }
        if (id) {
            onChange(editValue)
        }
    },[editValue])



    return (
        <Editor
            value={editValue}
            plugins={plugins}
            locale={i18n.language !== "zh-CN" ? null : zh_Hans}
            uploadImages={async (files) => {
                let hash
                const formData = new FormData()
                formData.append('file',files[0])
                await ipfsImg(formData)
                .then((res)=>{
                    hash = res.hash
                })
                return [{
                    url: `${ipfsPath}/${hash}`
                }]
            }}
            onChange={(e) => {
                setEditValue(e)
            }}
            
        />
    )
}