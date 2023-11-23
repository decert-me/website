import Dexie from 'dexie';

const library = {
    publish: '++id,title,desc,editor,fileList,questions,score,difficulty,time,update_time',
    editChallenge: '++id,token_id,title,questions,update_time'
}

export function saveCache(dataBase, values, isEdit) {

    // 编辑模式则抛出 publish
    if (dataBase === "publish" && isEdit) {
        return
    }

    const db = new Dexie('decert.me');
    db.version(1).stores(library);

    async function getDataBase(dataBase) {
        const arr = await db[dataBase].toArray()
        return arr
    }
    
    switch (dataBase) {
        case "publish":
            saveCachePublish(values)
            break;
        case "editChallenge":
            saveCacheEdit(values)
            break;
        default:
            break;
    }

    async function saveCacheEdit({
        token_id,
        title,
        questions
    }) {
        const count = await db.table("editChallenge").count().catch(() => 0);;
        // count > 0 ? "add" : "update"
        if (count > 0) {
            const arr = await getDataBase("editChallenge");
            db.editChallenge.put({id: arr[0].id, token_id, title, questions, update_time: Math.floor(Date.now() / 1000)})
        }else{
            console.log(db);
            db.editChallenge.add({token_id, title, questions, update_time: Math.floor(Date.now() / 1000)})
        }
    }

    async function saveCachePublish({ 
        title,
        desc,
        editor,
        fileList,
        questions,
        score,
        difficulty,
        time
    }) {
        const count = await db.table("publish").count().catch(() => 0);;
        const newfileList = fileList?.fileList || fileList
        // count > 0 ? "add" : "update"
        if (count > 0) {
            const arr = await getDataBase("publish");
            db.publish.put({id: arr[0].id, title, desc, editor, fileList: newfileList, questions, score, difficulty, time, update_time: Math.floor(Date.now() / 1000)})
        }else{
            db.publish.add({title, desc, editor, fileList: newfileList, questions, score, difficulty, time, update_time: Math.floor(Date.now() / 1000)})
        }
    }
}


export async function getDataBase(dataBase) {
    const db = new Dexie('decert.me');
    db.version(1).stores(library);
    const arr = await db[dataBase].toArray()
    return arr
}

export async function clearDataBase(dataBase) {
    const db = new Dexie('decert.me');
    db.version(1).stores(library);
    await db[dataBase].clear();
}