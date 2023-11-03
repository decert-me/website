

export async function importFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    return await new Promise((resolve, reject) => {        
        reader.onload = (e) => {
            const content = e.target.result;
            const titleReg = /\d+\.\s(.*?)(?=[（(]\d+[)）]|$|\n)/g;
            const titles = content.match(titleReg);
    
            const questions = content.trim().split(/\n\s*\n/);
            const result = questions.map((question, index) => {
                const lines = question.split('\n');
                const arr = lines[0].match(/[（(](\d+)[)）]/);
                const score = arr ? Number(arr[1]) : 10;
                const title = titles[index].replace(/^\d+\.\s/, '');
                let options = [];
                let answers = [];
                let type;
                lines.slice(1).forEach((line, index) => {
                    if (line.startsWith('    - ')) {
                        options = lines.slice(1).map(line => {
                            let match = line.match(/- \[(.)\] (.*)/);
                            return match ? match[2] : null;
                        }).filter(Boolean);
                        if (line.includes('[x]')) {
                            answers.push(index);
                        }
                    } else {
                        // Handle the new question format
                        options.push(eval(line));
                        answers.push(eval(line));
                    }
                });
                type = options.length === 1 ? "fill_blank" : answers.length === 1 ? "multiple_choice" : "multiple_response"
                if (type === "multiple_choice") {
                    answers = answers[0]
                }
                if (type === "fill_blank") {
                    answers = String(answers[0])
                    options[0] = String(options[0])
                }
                return { options, answers, score, title, type };
            });
            resolve(result);
        };
        reader.readAsText(file);
    })
    .then(res => {
        return res
    })
}