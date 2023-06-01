


export function exampleAction(dom, type, point, position) {
    const img = document.querySelector(dom);
    const flag = document.querySelector(point);
    img.style.display = type;
    const { top, left } = document.querySelector(point).getBoundingClientRect();
    if (position === "top") {
        img.style.bottom = document.documentElement.offsetHeight - top + 50 + "px";
        img.style.left = (document.documentElement.offsetWidth - img.offsetWidth) / 2 + "px";
    }
    if (position === "tr") {
        img.style.bottom = document.documentElement.offsetHeight - top + "px";
        img.style.left = left + flag.offsetWidth + "px";
    }
}