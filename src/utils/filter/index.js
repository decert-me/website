export const filterType = (values) => {
    /**
        0 - multiple_choice
        1 - multiple_response
        2 - fill_blank
        3 - coding
        4 - special_judge_coding
     */
    let type = ''
    let num = 0
    let ans 
    if (values.options.length === 1){
        type = "fill_blank"
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
            type = "multiple_choice"
            values.options.map((e,i)=>{
                if (e.options === 2){
                    ans = i
                }
            })
        }else{
            type = "multiple_response"
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