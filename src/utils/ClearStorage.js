

export const ClearStorage = () => {
    localStorage.removeItem('decert.token')
    localStorage.removeItem("decert.address");
    localStorage.removeItem('decert.cache');

}