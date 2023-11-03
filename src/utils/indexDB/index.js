import Dexie from "dexie";

export function storeDB(params) {
    
    const db = new Dexie('decert.me');
    
    db.version(1).stores({
        store: '++id, introduction, content, status, creator, create_time'    //  publish cache
    });
    
    function operate({id, introduction, content, creator, status}, type) {
        const create_time = new Date().getTime();
        switch (type) {
            case "add":
                console.log("add ====>");
                db.store.add({introduction, content, status, creator, create_time})
                break;
            case "update":
                console.log("put ====>");
                db.store.put({id, introduction, content, status, creator, create_time})
                break;
            case "delete":
                db.store.delete(id)
                break;
            default:
                break;
        }
    }

    async function getValues(params) {
        const arr = await db.store.toArray()
        return arr
    }

    return {
        operate,
        getValues,
        db
    }
}