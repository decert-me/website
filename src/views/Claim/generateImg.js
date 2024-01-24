import { ipfsImg } from "@/request/api/public";
import { forwardRef, useImperativeHandle, useRef } from "react";


function GenerateImg(params, ref) {
    
    const canvasRef = useRef(null);
    const px = 1024;
    const maskHeight = px * 0.23;
    const textHeight = 64;
    const textPad = 60;
    const textMaxWidth = px - (textPad * 2);

    function splitWords(ctx, text) {
        // 分割
        let words = text.match(/[\u4e00-\u9fa5]|[^\u4e00-\u9fa5]|\S+/g);
        let line = '';
        let lines = [];

        for (let i = 0; i < words.length; i++) {
            let testLine = line + words[i];
            let testWidth = ctx.measureText(testLine).width;
            if (testWidth > textMaxWidth && i > 0) {
                lines.push(line.trim());
                line = words[i];
                if (lines.length == 2) {
                    // If we already have two lines, add an ellipsis to the end of the second line and break the loop
                    lines[1] = lines[1].trim() + '...';
                    break;
                }
            } else {
                line = testLine;
            }
        }
        if (lines.length < 2) {
            lines.push(line.trim());
        }

        for (var i = 0; i < lines.length; i++) {
            const lineHeight = lines.length === 2 ? textHeight : textHeight*2
            const textpd = (lineHeight - 64) / 2 + (5 * i);
            ctx.fillText(lines[i], textPad, (px * 0.88) + (i * lineHeight) + textpd);
        }
    }

    async function generate(base64, text) {
        return await new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = base64;
            img.onload = async function() {
                const canvas = canvasRef.current;
                const ctx = canvas?.getContext('2d');
                // 宽高
                canvas.width = px;
                canvas.height = px;
                    
                // img
                ctx.drawImage(img, 0, 0, px, px);
                
                // mask
                let mask = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - maskHeight)
                mask.addColorStop(0, 'rgba(0, 0, 0, 1)'); // Black at the bottom
                mask.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Transparent at the top
                ctx.fillStyle = mask;
                ctx.fillRect(0, canvas.height - maskHeight, canvas.width, maskHeight);
    
                // text
                ctx.font = '64px Arial';
                ctx.fillStyle = 'white';
                splitWords(ctx, text);
    
                try {
                    // download
                    const dataUrl = canvas.toDataURL('image/png');
                    // base64转换为Blob
                    const blob = await (await fetch(dataUrl)).blob();
                    // Blob转换为file
                    const file = new File([blob], 'image.png', {type: 'image/png'});
                    const formData = new FormData();
                    formData.append('file', file);
                    await ipfsImg(formData)
                    .then(res => {
                        if (res.status === 0) {
                            resolve(res.data.hash);
                        }else{
                            reject(res.message);
                        }
                    })
                } catch (error) {
                    reject(error)
                }
            }
            img.onerror = function() {
                reject(new Error('Image load failed'));
            };
        })
        .then(res => {
            return res
        })
        .catch(err => {
            throw new Error(err)
        })
    }

    useImperativeHandle(ref, () => ({
        generate
    }))

    return (
        <div className="generateImg">
            <canvas ref={canvasRef} />
        </div>
    )
}
export default forwardRef(GenerateImg)