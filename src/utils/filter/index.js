export const filterType = (values) => {
    let type = ''
    let num = 0
    let ans 
    if (values.options.length === 1){
        type = 2
        values.options.map((e)=>{
            ans = e.title
        })
    }else{
        values.options.map((e)=>{
            if (e.options === 2){
                num++;
            }
        })
        num === 1 ? type = 0 : type = 1;
        if (num === 1){
            type = 0
            values.options.map((e,i)=>{
                if (e.options === 2){
                    ans = i
                }
            })
        }else{
            type = 1
            ans = []
            values.options.map((e,i)=>{
                if (e.options===2){
                    ans.push(i)
                }
            })
        }
    }

    return {
        type,
        ans
    }
}

export const filterQuestions = (arr) => {
    let answers = [];
    let questions = [];

    arr.map(e => {
        answers.push(e.answers);
        questions.push({
            title: e.title,
            options: e.options,
            type: e.type,
            score: e.score
        })
    })

    return {
        answers,
        questions
    }
}